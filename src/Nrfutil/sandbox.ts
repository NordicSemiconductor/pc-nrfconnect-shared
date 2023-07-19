/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { CancelablePromise } from 'cancelable-promise';
import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

import {
    BackgroundTask,
    CancellableOperation,
    LogMessage,
    NrfutilJson,
    NrfUtilSettings,
    Progress,
    TaskEnd,
    TaskProgress,
    Version,
} from './sandboxTypes';

export type NrfutilSandboxType = ReturnType<typeof NrfutilSandbox>;

const NrfutilSandbox = (
    baseDir: string,
    module: string,
    version: string,
    setting?: NrfUtilSettings
) => {
    const onLoggingHandlers: ((logging: LogMessage) => void)[] = [];

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

    const getModuleVersion = (): Promise<Version> =>
        new Promise((resolve, reject) => {
            fs.existsSync(
                path.join(
                    baseDir,
                    'sandbox',
                    module,
                    version,
                    `nrfutil-${module}`
                )
            );

            let result: Version;
            const nrfutil = spawn(
                'nrfutil',
                [module, ' --version', ' --json', '--log-output=stdout'],
                {
                    env,
                }
            );

            nrfutil.stdout.on('data', data => {
                const parsedData: NrfutilJson<unknown> = JSON.parse(data);
                if (!processLoggingData(parsedData)) {
                    if (parsedData.type === 'info') {
                        result = parsedData.data as unknown as Version;
                    }
                }
            });

            nrfutil.on('close', code => {
                if (code === 0) {
                    resolve(result);
                } else {
                    reject(new Error(`Failed with error code ${code}`));
                }
            });
        });

    const isSandboxInstalled = (): Promise<boolean> =>
        new Promise((resolve, reject) => {
            fs.existsSync(
                path.join(
                    baseDir,
                    'sandbox',
                    module,
                    version,
                    `nrfutil-${module}`
                )
            );
            getModuleVersion()
                .then(moduleVersion =>
                    resolve(moduleVersion.version === version)
                )
                .then(reject);
        });

    const prepareSandbox = (
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            let result: Version;
            const nrfutil = spawn(
                'nrfutil',
                [
                    'install',
                    `${module}=${version}`,
                    '--force',
                    ' --json',
                    '--log-output=stdout',
                ],
                {
                    env: {
                        ...env,
                        NRFUTIL_EXEC_PATH: path.join(baseDir),
                    },
                }
            );

            let taskEnd: TaskEnd;
            let stdErr: string;

            nrfutil.stdout.on('data', data => {
                const parsedData: NrfutilJson<unknown> = JSON.parse(data);
                if (!processLoggingData(parsedData)) {
                    switch (parsedData.type) {
                        case 'task_progress':
                            onProgress?.(
                                (parsedData.data as unknown as TaskProgress)
                                    .progress
                            );
                            break;
                        case 'task_end':
                            taskEnd = parsedData.data as unknown as TaskEnd;
                            break;
                    }
                    if (parsedData.type === 'info') {
                        result = parsedData.data as unknown as Version;
                    }
                }
            });

            nrfutil.stderr.on('data', data => {
                stdErr += data;
            });

            nrfutil.on('close', code => {
                if (code === 0 && taskEnd.result === 'success') {
                    resolve();
                } else {
                    let msg = `Failed with exit code ${code}`;
                    if (taskEnd.message) {
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
                'nrfutil',
                [
                    command,
                    `${module}${version}`,
                    ...args,
                    ' --json',
                    '--log-output=stdout',
                ],
                {
                    env,
                }
            );

            let taskEnd: TaskEnd<Result>;
            let stdErr: string;

            nrfutil.stdout.on('data', data => {
                const parsedData: NrfutilJson<unknown> = JSON.parse(data);
                if (!processLoggingData(parsedData)) {
                    switch (parsedData.type) {
                        case 'task_progress':
                            onProgress?.(
                                (parsedData.data as unknown as TaskProgress)
                                    .progress
                            );
                            break;
                        case 'task_end':
                            taskEnd =
                                parsedData.data as unknown as TaskEnd<Result>;
                            break;
                    }
                }
            });

            nrfutil.stderr.on('data', data => {
                stdErr += data;
            });

            nrfutil.on('close', code => {
                if (code === 0 && taskEnd.result === 'success') {
                    resolve(taskEnd.data as unknown as Result);
                } else {
                    let msg = `Failed with exit code ${code}`;
                    if (taskEnd.message) {
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

    const execBackgroundSubcommand = <Result>(
        command: string,
        args: string[],
        processors: BackgroundTask<Result>
    ): CancellableOperation => {
        let running = true;
        const closedHandlers: ((code: number | null) => void)[] = [];

        const nrfutil = spawn(
            'nrfutil',
            [
                command,
                `${module}${version}`,
                ...args,
                ' --json',
                '--log-output=stdout',
            ],
            {
                env,
            }
        );

        nrfutil.stdout.on('data', data => {
            const parsedData: NrfutilJson<unknown> = JSON.parse(data);
            if (!processLoggingData(parsedData)) {
                switch (parsedData.type) {
                    case 'task_end':
                        (
                            parsedData.data as unknown as TaskEnd<Result[]>
                        ).data?.forEach(processors.onData);
                        break;
                    case 'info':
                        processors.onData(parsedData.data as unknown as Result);
                        break;
                }
            }
        });

        nrfutil.stderr.on('data', data => {
            processors.onError(new Error(data));
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
    };
};

export default NrfutilSandbox;
