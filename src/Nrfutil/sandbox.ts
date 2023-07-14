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
import {
    BackgroundTask,
    CancellableOperation,
    LogLevel,
    LogMessage,
    ModuleVersion,
    NrfutilJson,
    NrfUtilSettings,
    Progress,
    TaskEnd,
    TaskProgress,
} from './sandboxTypes';

export type NrfutilSandboxType = ReturnType<typeof NrfutilSandbox>;

const parseJsonBuffers = <T>(data: Buffer): T[] =>
    JSON.parse(`[${data.toString().replaceAll('}\n{', '}\n,{')}]`) ?? [];

const NrfutilSandbox = (
    baseDir: string,
    module: string,
    version: string,
    setting?: NrfUtilSettings
) => {
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

        if (setting?.bootstrapConfigUrl)
            env.NRFUTIL_BOOTSTRAP_CONFIG_URL = setting.bootstrapConfigUrl;
        if (setting?.bootstrapTarballPath)
            env.NRFUTIL_BOOTSTRAP_TARBALL_PATH = setting.bootstrapTarballPath;
        if (setting?.devicePluginsDirForceNrfdlLocation)
            env.NRFUTIL_DEVICE_PLUGINS_DIR_FORCE_NRFDL_LOCATION =
                setting.devicePluginsDirForceNrfdlLocation;
        if (setting?.devicePluginsDirForceNrfutilLocation)
            env.NRFUTIL_DEVICE_PLUGINS_DIR_FORCE_NRFUTIL_LIBDIR =
                setting.devicePluginsDirForceNrfutilLocation;
        if (setting?.ignoreMissingSubCommand)
            env.NRFUTIL_IGNORE_MISSING_SUBCOMMAND =
                setting.ignoreMissingSubCommand;
        if (setting?.log) env.NRFUTIL_LOG = setting.log;
        if (setting?.packageIndexUrl)
            env.NRFUTIL_PACKAGE_INDEX_URL = setting.packageIndexUrl;

        return env;
    };

    const processLoggingData = (data: NrfutilJson<unknown>) => {
        if (data.type === 'log') {
            onLoggingHandlers.forEach(onLogging =>
                onLogging(data.data as unknown as LogMessage)
            );
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
    ) => {
        const parsedData: NrfutilJson<Result>[] = parseJsonBuffers(data);
        parsedData.forEach(item => {
            switch (item.type) {
                case 'task_progress':
                    callbacks.onProgress?.(
                        (item.data as unknown as TaskProgress).progress
                    );
                    break;
                case 'task_end':
                    callbacks.onTaskEnd?.(
                        item.data as unknown as TaskEnd<Result>
                    );
                    break;
                case 'info':
                    callbacks.onInfo?.(item.data as unknown as Result);
                    break;
                case 'log':
                    callbacks.onLogging?.(item.data as unknown as LogMessage);
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
                            msg += `\nError: ${stdErr}`;
                        }

                        reject(new Error(msg));
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
        parser: (data: Buffer) => void,
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

            nrfutil.stdout.on('data', (data: Buffer) => {
                parser(data);
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
                const parsedData: NrfutilJson<unknown>[] =
                    parseJsonBuffers(data);

                parsedData.forEach(item => {
                    if (!processLoggingData(item)) {
                        if (item.type === 'info') {
                            processors.onData(item.data as unknown as Result);
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
    version: string,
    setting?: NrfUtilSettings
) =>
    new Promise<NrfutilSandboxType>((resolve, reject) => {
        const sandbox = NrfutilSandbox(baseDir, module, version, setting);

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
    version: string,
    createModule: (sandbox: NrfutilSandboxType) => Module,
    setting?: NrfUtilSettings
) =>
    new Promise<Module>((resolve, reject) => {
        prepareSandbox(baseDir, module, version, setting)
            .then(sandbox => resolve(createModule(sandbox)))
            .catch(reject);
    });
