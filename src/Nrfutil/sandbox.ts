/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { CancelablePromise } from 'cancelable-promise';
import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

import logger from '../logging';
import packageJson from '../utils/packageJson';
import {
    BackgroundTask,
    CancellableOperation,
    LogLevel,
    LogMessage,
    ModuleVersion,
    NrfutilJson,
    Progress,
    TaskEnd,
} from './sandboxTypes';

export type NrfutilSandboxType = ReturnType<typeof NrfutilSandbox>;

const parseJsonBuffers = <T>(data: Buffer): T[] | undefined => {
    const dataString = data.toString().trim();
    if (!dataString.endsWith('}')) {
        return undefined;
    }
    try {
        return JSON.parse(`[${dataString.replaceAll('}\n{', '}\n,{')}]`) ?? [];
    } catch {
        return undefined;
    }
};

const NrfutilSandbox = (baseDir: string, module: string, version: string) => {
    const onLoggingHandlers: ((logging: LogMessage) => void)[] = [];
    let logLevel: LogLevel = 'info';

    const prepareEnv = () => {
        const env = { ...process.env };
        env.NRFUTIL_HOME = path.join(
            baseDir,
            'nrfutil-sandboxes',
            module,
            version
        );
        fs.mkdirSync(env.NRFUTIL_HOME, { recursive: true });

        env.NRFUTIL_EXEC_PATH = path.join(env.NRFUTIL_HOME, 'bin');

        if (
            env.NODE_ENV === 'production' &&
            !env.NRF_OVERRIDE_NRFUTIL_SETTINGS
        ) {
            delete env.NRFUTIL_BOOTSTRAP_CONFIG_URL;
            delete env.NRFUTIL_BOOTSTRAP_TARBALL_PATH;
            delete env.NRFUTIL_DEVICE_PLUGINS_DIR_FORCE_NRFDL_LOCATION;
            delete env.NRFUTIL_DEVICE_PLUGINS_DIR_FORCE_NRFUTIL_LIBDIR;
            delete env.NRFUTIL_IGNORE_MISSING_SUBCOMMAND;
            delete env.NRFUTIL_LOG;
            delete env.NRFUTIL_PACKAGE_INDEX_URL;
        }

        return env;
    };

    const processLoggingData = (data: NrfutilJson) => {
        if (data.type === 'log') {
            onLoggingHandlers.forEach(onLogging => onLogging(data.data));
            return true;
        }

        return false;
    };

    const commonParser = <Result>(
        data: Buffer,
        callbacks: {
            onProgress?: (progress: Progress) => void;
            onInfo?: (info: Result) => void;
            onTaskEnd?: (taskEnd: TaskEnd<Result>) => void;
            onLogging?: (logging: LogMessage) => void;
        }
    ): Buffer | undefined => {
        const parsedData: NrfutilJson<Result>[] | undefined =
            parseJsonBuffers(data);

        if (!parsedData) {
            return data;
        }

        parsedData.forEach(item => {
            switch (item.type) {
                case 'task_progress':
                    callbacks.onProgress?.(item.data.progress);
                    break;
                case 'task_end':
                    callbacks.onTaskEnd?.(item.data);
                    break;
                case 'info':
                    callbacks.onInfo?.(item.data);
                    break;
                case 'log':
                    callbacks.onLogging?.(item.data);
                    break;
            }
        });
    };

    const env = prepareEnv();

    const getModuleVersion = (): Promise<ModuleVersion> =>
        new Promise((resolve, reject) => {
            execNrfutil<ModuleVersion>(module, ['--version'])
                .then(results => {
                    if (results.info.length === 1) {
                        resolve(results.info[0]);
                    } else {
                        reject(new Error('Unexpected result'));
                    }
                })
                .catch(reject);
        });

    const isSandboxInstalled = (): Promise<boolean> =>
        new Promise((resolve, reject) => {
            if (
                fs.existsSync(
                    path.join(
                        baseDir,
                        'nrfutil-sandboxes',
                        module,
                        version,
                        'bin',
                        `nrfutil-${module}${
                            os.platform() === 'win32' ? '.exe' : ''
                        }`
                    )
                )
            ) {
                getModuleVersion()
                    .then(moduleVersion =>
                        resolve(moduleVersion.version === version)
                    )
                    .then(reject);
            } else {
                resolve(false);
            }
        });

    const prepareSandbox = (
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            logger.info(`Preparing nrfutil-${module} version: ${version}`);
            const operation = execNrfutil(
                'install',
                [`${module}=${version}`, '--force'],
                onProgress
            )
                .then(() => {
                    logger.info(
                        `Successfully installed nrfutil-${module} version: ${version}`
                    );
                    resolve();
                })
                .catch(error => {
                    logger.error(
                        `Error while installing nrfutil-${module} version: ${version}`
                    );
                    logger.error(error);
                    reject(error);
                });

            onCancel(operation.cancel);
        });

    const execNrfutil = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<{ taskEnd: TaskEnd<Result>[]; info: Result[] }> =>
        new CancelablePromise<{ taskEnd: TaskEnd<Result>[]; info: Result[] }>(
            (resolve, reject, onCancel) => {
                const info: Result[] = [];
                const taskEnd: TaskEnd<Result>[] = [];
                let stdErr: string | undefined;

                const operation = execCommand(
                    command,
                    args,
                    data =>
                        commonParser<Result>(data, {
                            onProgress,
                            onTaskEnd: end => {
                                taskEnd.push(end);
                            },
                            onInfo: i => {
                                info.push(i);
                            },
                            onLogging: logging => {
                                onLoggingHandlers.forEach(onLogging => {
                                    onLogging(logging);
                                });
                            },
                        }),
                    data => {
                        stdErr += data.toString();
                    }
                )
                    .then(() => {
                        if (!taskEnd.find(end => end.result === 'fail')) {
                            resolve({ taskEnd, info });
                        } else {
                            reject(new Error(stdErr ?? 'Unknown error'));
                        }
                    })
                    .catch(error => {
                        let msg = error.message;

                        const taskEndMsg = taskEnd
                            .map(end =>
                                end.message ? `Message: ${end.message}` : ''
                            )
                            .filter(message => !!message)
                            .join('\n');

                        if (taskEndMsg) {
                            msg += `\n${taskEndMsg}`;
                        }

                        if (stdErr) {
                            msg += `\n${stdErr}`;
                        }

                        error.message = msg;

                        reject(error);
                    });

                onCancel(operation.cancel);
            }
        );
    const execSubcommand = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress) => void
    ) => execNrfutil<Result>(module, [command, ...args], onProgress);

    const execCommand = (
        command: string,
        args: string[],
        parser: (data: Buffer) => Buffer | undefined,
        onStdError: (data: Buffer) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            const nrfutil = spawn(
                path.join(baseDir, 'nrfutil'),
                [
                    command,
                    ...args,
                    '--json',
                    '--log-output=stdout',
                    '--log-level',
                    logLevel,
                ],
                {
                    env,
                }
            );

            let buffer = Buffer.from('');

            nrfutil.stdout.on('data', (data: Buffer) => {
                buffer = Buffer.concat([buffer, data]);
                const remainingBytes = parser(buffer);
                if (remainingBytes) {
                    buffer = remainingBytes;
                } else {
                    buffer = Buffer.from('');
                }
            });

            nrfutil.stderr.on('data', (data: Buffer) => {
                onStdError(data);
            });

            nrfutil.on('close', code => {
                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Failed with exit code ${code}`));
                }
            });

            onCancel(() => nrfutil.kill('SIGINT'));
        });

    const execBackgroundSubcommand = <Result>(
        command: string,
        args: string[],
        processors: BackgroundTask<Result>
    ): CancellableOperation => {
        let running = true;
        const closedHandlers: ((error?: Error) => void)[] = [];

        const operation = execCommand(
            module,
            [command, ...args],
            data => {
                const parsedData: NrfutilJson<Result>[] | undefined =
                    parseJsonBuffers(data);

                if (!parsedData) {
                    return data;
                }

                parsedData.forEach(item => {
                    if (!processLoggingData(item)) {
                        if (item.type === 'info') {
                            processors.onData(item.data);
                        }
                    }
                });
            },
            data => {
                processors.onError(new Error(data.toString()));
            }
        )
            .then(() => {
                running = false;
                closedHandlers.forEach(callback => callback());
            })
            .catch(error => {
                running = false;
                closedHandlers.forEach(callback => callback(error));
            });

        return {
            stop: callback => {
                operation.cancel();
                if (callback) closedHandlers.push(callback);
            },
            isRunning: () => running,
            onClosed: (handler: (error?: Error) => void) => {
                closedHandlers.push(handler);

                return () =>
                    closedHandlers.splice(closedHandlers.indexOf(handler), 1);
            },
        };
    };

    return {
        isSandboxInstalled,
        getModuleVersion,
        prepareSandbox,
        execSubcommand,
        execBackgroundSubcommand,
        onLogging: (handler: (logging: LogMessage) => void) => {
            onLoggingHandlers.push(handler);

            return () =>
                onLoggingHandlers.splice(onLoggingHandlers.indexOf(handler), 1);
        },
        setLogLevel: (level: LogLevel) => {
            logLevel = level;
        },
    };
};

export const prepareSandbox = (
    baseDir: string,
    module: string,
    version?: string
) =>
    new Promise<NrfutilSandboxType>((resolve, reject) => {
        const moduleVersions = packageJson().nrfutil?.[module];
        if (!version && (!moduleVersions || moduleVersions.length === 0)) {
            throw new Error(`No version specified for nrfutil-${module}`);
        }

        const sandbox = NrfutilSandbox(
            baseDir,
            module,
            version ?? (moduleVersions?.[0] as string)
        );

        sandbox
            .isSandboxInstalled()
            .then(result => {
                if (!result) {
                    sandbox
                        .prepareSandbox()
                        .then(() => resolve(sandbox))
                        .catch(reject);
                    return;
                }

                resolve(sandbox);
            })
            .catch(reject);
    });

export const prepareAndCreate = <Module>(
    baseDir: string,
    module: string,
    createModule: (sandbox: NrfutilSandboxType) => Module,
    version?: string
) =>
    new Promise<Module>((resolve, reject) => {
        prepareSandbox(baseDir, module, version)
            .then(sandbox => resolve(createModule(sandbox)))
            .catch(reject);
    });
