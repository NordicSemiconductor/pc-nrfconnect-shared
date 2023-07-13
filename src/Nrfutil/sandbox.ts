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
        env.NRFUTIL_HOME = path.join(baseDir, 'sandbox', module, version);
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

    const env = prepareEnv();

    const getModuleVersion = (): Promise<ModuleVersion> =>
        new Promise((resolve, reject) => {
            let result: ModuleVersion;
            const nrfutil = spawn(
                path.join(baseDir, 'nrfutil'),
                [module, '--version', '--json', '--log-output=stdout'],
                {
                    env,
                }
            );

            nrfutil.stdout.on('data', data => {
                const parsedData: NrfutilJson<unknown>[] =
                    parseJsonBuffers(data);

                parsedData.forEach(item => {
                    if (item.type === 'info') {
                        result = item.data as unknown as ModuleVersion;
                    }
                });
            });

            let stdErr: string | undefined;
            nrfutil.stderr.on('data', (data: Buffer) => {
                stdErr += data.toString();
            });

            nrfutil.on('close', code => {
                if (code === 0) {
                    resolve(result);
                } else {
                    let msg = `Failed with exit code ${code}`;

                    if (stdErr) {
                        msg += `\nError: ${stdErr}`;
                    }

                    reject(new Error(msg));
                }
            });
        });

    const isSandboxInstalled = (): Promise<boolean> =>
        new Promise((resolve, reject) => {
            if (
                fs.existsSync(
                    path.join(
                        baseDir,
                        'sandbox',
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
            const nrfutil = spawn(
                path.join(baseDir, 'nrfutil'),
                [
                    'install',
                    `${module}=${version}`,
                    '--force',
                    '--json',
                    '--log-output=stdout',
                    '--log-level',
                    logLevel,
                ],
                {
                    env: {
                        ...env,
                        NRFUTIL_EXEC_PATH: baseDir,
                    },
                }
            );

            let taskEnd: TaskEnd | undefined;
            let stdErr: string | undefined;

            nrfutil.stdout.on('data', (data: Buffer) => {
                const parsedData: NrfutilJson<unknown>[] =
                    parseJsonBuffers(data);
                parsedData.forEach(item => {
                    if (!processLoggingData(item)) {
                        switch (item.type) {
                            case 'task_progress':
                                onProgress?.(
                                    (item.data as unknown as TaskProgress)
                                        .progress
                                );
                                break;
                            case 'task_end':
                                taskEnd = item.data as unknown as TaskEnd;
                                break;
                        }
                    }
                });
            });

            nrfutil.stderr.on('data', (data: Buffer) => {
                stdErr += data.toString();
            });

            nrfutil.on('close', code => {
                if (code === 0 && taskEnd?.result === 'success') {
                    logger.info(
                        `Successfully Installed nrfutil-${module} version: ${version}`
                    );
                    resolve();
                } else {
                    let msg = `Failed with exit code ${code}`;
                    if (taskEnd?.message) {
                        msg += `\nMessage: ${taskEnd.message}`;
                    }

                    if (stdErr) {
                        msg += `\nError: ${stdErr}`;
                    }

                    reject(new Error(msg));
                }
            });

            onCancel(() => nrfutil.kill('SIGINT'));
        });

    const execSubcommand = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<Result> =>
        new CancelablePromise<Result>((resolve, reject, onCancel) => {
            const nrfutil = spawn(
                path.join(baseDir, 'nrfutil'),
                [
                    module,
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

            let taskEnd: TaskEnd<Result> | undefined;
            let stdErr: string | undefined;

            nrfutil.stdout.on('data', (data: Buffer) => {
                const parsedData: NrfutilJson<unknown>[] =
                    parseJsonBuffers(data);
                parsedData.forEach(item => {
                    if (!processLoggingData(item)) {
                        switch (item.type) {
                            case 'task_progress':
                                onProgress?.(
                                    (item.data as unknown as TaskProgress)
                                        .progress
                                );
                                break;
                            case 'task_end':
                                taskEnd =
                                    item.data as unknown as TaskEnd<Result>;
                                break;
                        }
                    }
                });
            });

            nrfutil.stderr.on('data', (data: Buffer) => {
                stdErr += data.toString();
            });

            nrfutil.on('close', code => {
                if (code === 0 && taskEnd?.result === 'success') {
                    resolve(taskEnd?.data as unknown as Result);
                } else {
                    let msg = `Failed with exit code ${code}`;
                    if (taskEnd?.message) {
                        msg += `\nMessage: ${taskEnd?.message}`;
                    }

                    if (stdErr) {
                        msg += `\nError: ${stdErr}`;
                    }

                    reject(new Error(msg));
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
        const closedHandlers: ((code: number | null) => void)[] = [];

        const nrfutil = spawn(
            path.join(baseDir, 'nrfutil'),
            [
                module,
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
            const parsedData: NrfutilJson<unknown>[] = parseJsonBuffers(data);

            parsedData.forEach(item => {
                if (!processLoggingData(item)) {
                    if (item.type === 'info') {
                        processors.onData(item.data as unknown as Result);
                    }
                }
            });
        });

        nrfutil.stderr.on('data', (data: Buffer) => {
            processors.onError(new Error(data.toString()));
        });

        nrfutil.on('close', code => {
            running = false;
            closedHandlers.forEach(callback => callback(code));
        });

        return {
            stop: callback => {
                nrfutil.kill('SIGINT');
                if (callback) closedHandlers.push(callback);
            },
            isRunning: () => running,
            onClosed: (handler: (code: number | null) => void) => {
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

export default NrfutilSandbox;
