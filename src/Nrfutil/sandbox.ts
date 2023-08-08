/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import winston from 'winston';

import describeError from '../logging/describeError';
import packageJson from '../utils/packageJson';
import {
    BackgroundTask,
    LogLevel,
    LogMessage,
    ModuleVersion,
    NrfutilJson,
    Progress,
    TaskEnd,
} from './sandboxTypes';

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

const prepareEnv = (baseDir: string, module: string, version: string) => {
    const env = { ...process.env };
    env.NRFUTIL_HOME = path.join(baseDir, 'nrfutil-sandboxes', module, version);
    fs.mkdirSync(env.NRFUTIL_HOME, { recursive: true });

    env.NRFUTIL_EXEC_PATH = path.join(env.NRFUTIL_HOME, 'bin');

    if (env.NODE_ENV === 'production' && !env.NRF_OVERRIDE_NRFUTIL_SETTINGS) {
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

export class NrfutilSandbox {
    baseDir: string;
    module: string;
    version: string;
    onLoggingHandlers: ((logging: LogMessage) => void)[] = [];
    logLevel: LogLevel = 'info';
    env: ReturnType<typeof prepareEnv>;

    constructor(baseDir: string, module: string, version: string) {
        this.baseDir = baseDir;
        this.module = module;
        this.version = version;

        this.env = prepareEnv(baseDir, module, version);
    }

    private processLoggingData = (data: NrfutilJson) => {
        if (data.type === 'log') {
            this.onLoggingHandlers.forEach(onLogging => onLogging(data.data));
            return true;
        }

        return false;
    };

    public getModuleVersion = async () => {
        const results = await this.execNrfutil<ModuleVersion>(this.module, [
            '--version',
        ]);

        if (results.info.length === 1) {
            return results.info[0];
        }

        throw new Error('Unexpected result');
    };

    public isSandboxInstalled = async () => {
        if (
            fs.existsSync(
                path.join(
                    this.baseDir,
                    'nrfutil-sandboxes',
                    this.module,
                    this.version,
                    'bin',
                    `nrfutil-${this.module}${
                        os.platform() === 'win32' ? '.exe' : ''
                    }`
                )
            )
        ) {
            const moduleVersion = await this.getModuleVersion();
            return moduleVersion.version === this.version;
        }
        return false;
    };

    public prepareSandbox = async (
        onProgress?: (progress: Progress) => void,
        logger?: winston.Logger
    ) => {
        try {
            logger?.info(
                `Preparing nrfutil-${this.module} version: ${this.version}`
            );
            await this.execNrfutil(
                'install',
                [`${this.module}=${this.version}`, '--force'],
                onProgress
            );
            logger?.info(
                `Successfully installed nrfutil-${this.module} version: ${this.version}`
            );
        } catch (error) {
            logger?.error(
                `Error while installing nrfutil-${this.module} version: ${this.version}`
            );
            logger?.error(describeError(error));
            throw error;
        }
    };

    private execNrfutil = async <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress) => void,
        controller?: AbortController
    ) => {
        const info: Result[] = [];
        const taskEnd: TaskEnd<Result>[] = [];
        let stdErr: string | undefined;
        try {
            await this.execCommand(
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
                            this.onLoggingHandlers.forEach(onLogging => {
                                onLogging(logging);
                            });
                        },
                    }),
                data => {
                    stdErr += data.toString();
                },
                controller
            );

            if (!taskEnd.find(end => end.result === 'fail')) {
                return { taskEnd, info };
            }

            throw new Error(stdErr ?? 'Unknown error');
        } catch (e) {
            const error = e as Error;
            let msg = error.message;

            const taskEndMsg = taskEnd
                .map(end => (end.message ? `Message: ${end.message}` : ''))
                .filter(message => !!message)
                .join('\n');

            if (taskEndMsg) {
                msg += `\n${taskEndMsg}`;
            }

            if (stdErr) {
                msg += `\n${stdErr}`;
            }

            error.message = msg;

            throw error;
        }
    };

    private execSubcommand = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress) => void,
        controller?: AbortController
    ) =>
        this.execNrfutil<Result>(
            this.module,
            [command, ...args],
            onProgress,
            controller
        );

    private execCommand = (
        command: string,
        args: string[],
        parser: (data: Buffer) => Buffer | undefined,
        onStdError: (data: Buffer) => void,
        controller?: AbortController
    ) =>
        new Promise<void>((resolve, reject) => {
            const nrfutil = spawn(
                path.join(this.baseDir, 'nrfutil'),
                [
                    command,
                    ...args,
                    '--json',
                    '--log-output=stdout',
                    '--log-level',
                    this.logLevel,
                ],
                {
                    env: this.env,
                }
            );

            controller?.signal.addEventListener('abort', () => {
                nrfutil.kill('SIGINT');
            });

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
        });

    public execBackgroundSubcommand = <Result>(
        command: string,
        args: string[],
        processors: BackgroundTask<Result>
    ) => {
        const controller = new AbortController();
        let running = true;
        const closedHandlers: ((error?: Error) => void)[] = [];

        const operation = this.execCommand(
            this.module,
            [command, ...args],
            data => {
                const parsedData: NrfutilJson<Result>[] | undefined =
                    parseJsonBuffers(data);

                if (!parsedData) {
                    return data;
                }

                parsedData.forEach(item => {
                    if (!this.processLoggingData(item)) {
                        if (item.type === 'info') {
                            processors.onData(item.data);
                        }
                    }
                });
            },
            data => {
                processors.onError(new Error(data.toString()));
            },
            controller
        );

        operation
            .then(() => {
                running = false;
                closedHandlers.forEach(callback => callback());
            })
            .catch(error => {
                running = false;
                closedHandlers.forEach(callback => callback(error));
            });

        return {
            stop: (handler: () => void) => {
                closedHandlers.push(handler);
                controller.abort();
            },
            isRunning: () => running,
            onClosed: (handler: (error?: Error) => void) => {
                closedHandlers.push(handler);

                return () =>
                    closedHandlers.splice(closedHandlers.indexOf(handler), 1);
            },
        };
    };

    public singleTaskEndOperation = async <T = void>(
        command: string,
        onProgress?: (progress: Progress) => void,
        controller?: AbortController,
        args: string[] = []
    ) => {
        const results = await this.execSubcommand<T>(
            command,
            args,
            onProgress,
            controller
        );

        if (results.taskEnd.length === 1 && results.taskEnd[0].data) {
            return results.taskEnd[0].data;
        }
        throw new Error('Unexpected result');
    };

    public onLogging = (handler: (logging: LogMessage) => void) => {
        this.onLoggingHandlers.push(handler);

        return () =>
            this.onLoggingHandlers.splice(
                this.onLoggingHandlers.indexOf(handler),
                1
            );
    };

    public setLogLevel = (level: LogLevel) => {
        this.logLevel = level;
    };
}

export default async (
    baseDir: string,
    module: string,
    version?: string,
    onProgress?: (progress: Progress) => void,
    logger?: winston.Logger
) => {
    const env = { ...process.env };
    let overrideVersion: string | undefined;
    if (
        env.NODE_ENV !== 'production' ||
        (env.NODE_ENV === 'production' && !!env.NRF_OVERRIDE_NRFUTIL_SETTINGS)
    ) {
        overrideVersion =
            env[`NRF_OVERRIDE_VERSION_${module.toLocaleUpperCase()}`] ??
            undefined;
    }

    const moduleVersions = overrideVersion
        ? [overrideVersion]
        : packageJson().nrfConnectForDesktop?.nrfutil?.[module];

    if (!version && (!moduleVersions || moduleVersions.length === 0)) {
        throw new Error(`No version specified for nrfutil-${module}`);
    }

    const sandbox = new NrfutilSandbox(
        baseDir,
        module,
        version ?? (moduleVersions?.[0] as string)
    );

    onProgress?.({ progressPercentage: 0 });
    const result = await sandbox.isSandboxInstalled();

    if (!result) {
        await sandbox.prepareSandbox(onProgress, logger);
    }

    onProgress?.({ progressPercentage: 100 });
    return sandbox;
};
