/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { exec, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import treeKill from 'tree-kill';

import describeError from '../src/logging/describeError';
import telemetry from '../src/telemetry/telemetry';
import { isDevelopment } from '../src/utils/environment';
import { versionToInstall } from './moduleVersion';
import { getNrfutilLogger } from './nrfutilLogger';
import {
    BackgroundTask,
    LogLevel,
    LogMessage,
    ModuleVersion,
    NrfutilJson,
    NrfutilProgress,
    Progress,
    Task,
    TaskBegin,
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

const nrfutilSandboxFolder =
    process.platform === 'darwin' && process.arch !== 'x64'
        ? path.join('nrfutil-sandboxes', process.arch)
        : 'nrfutil-sandboxes';

const prepareEnv = (baseDir: string, module: string, version: string) => {
    const env = { ...process.env };
    env.NRFUTIL_HOME = path.join(
        baseDir,
        nrfutilSandboxFolder,
        module,
        version
    );
    fs.mkdirSync(env.NRFUTIL_HOME, { recursive: true });

    env.NRFUTIL_EXEC_PATH = path.join(env.NRFUTIL_HOME, 'bin');

    if (
        process.env.NODE_ENV === 'production' &&
        !process.env.NRF_OVERRIDE_NRFUTIL_SETTINGS
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

const commonParser = <Result>(
    data: Buffer,
    callbacks: {
        onProgress?: (progress: Progress, task?: Task) => void;
        onInfo?: (info: Result) => void;
        onTaskBegin?: (taskEnd: TaskBegin) => void;
        onTaskEnd?: (taskEnd: TaskEnd<Result>) => void;
        onLogging?: (logging: LogMessage, pid?: number) => void;
    },
    pid?: number
): Buffer | undefined => {
    const parsedData: NrfutilJson<Result>[] | undefined =
        parseJsonBuffers(data);

    if (!parsedData) {
        return data;
    }

    const processItem = (item: NrfutilJson<Result>) => {
        switch (item.type) {
            case 'task_progress':
                callbacks.onProgress?.(
                    convertNrfutilProgress(item.data.progress),
                    item.data.task
                );
                break;
            case 'task_begin':
                callbacks.onTaskBegin?.(item.data);
                break;
            case 'task_end':
                callbacks.onTaskEnd?.(item.data);
                break;
            case 'info':
                callbacks.onInfo?.(item.data);
                break;
            case 'log':
                callbacks.onLogging?.(item.data, pid);
                break;
            case 'batch_update':
                processItem(item.data.data);
                break;
        }
    };

    parsedData.forEach(processItem);
};

export class NrfutilSandbox {
    baseDir: string;
    module: string;
    version: string;
    onLoggingHandlers: ((logging: LogMessage, pid?: number) => void)[] = [];
    logLevel: LogLevel = isDevelopment ? 'error' : 'off';
    env: ReturnType<typeof prepareEnv>;

    constructor(baseDir: string, module: string, version: string) {
        this.baseDir = baseDir;
        this.module = module;
        this.version = version;

        this.env = prepareEnv(baseDir, module, version);
    }

    private processLoggingData = (data: NrfutilJson, pid?: number) => {
        if (data.type === 'log') {
            this.onLoggingHandlers.forEach(onLogging =>
                onLogging(data.data, pid)
            );
            return true;
        }

        return false;
    };

    public getModuleVersion = async () => {
        const results = await this.spawnNrfutil<ModuleVersion>(this.module, [
            '--version',
        ]);

        if (results.info.length === 1) {
            return results.info[0];
        }

        throw new Error('Unexpected result');
    };

    public getCoreVersion = async () => {
        const results = await this.spawnNrfutil<ModuleVersion>('--version', []);

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
                    nrfutilSandboxFolder,
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
        onProgress?: (progress: Progress, task?: Task) => void
    ) => {
        try {
            // Clean up any residual sandbox from before if any
            if (this.env.NRFUTIL_HOME && fs.existsSync(this.env.NRFUTIL_HOME)) {
                fs.rmSync(this.env.NRFUTIL_HOME, {
                    recursive: true,
                    force: true,
                });
            }
            await this.spawnNrfutil(
                'install',
                [`${this.module}=${this.version}`, '--force'],
                onProgress
            );
            getNrfutilLogger()?.info(
                `Successfully installed nrfutil-${this.module} version ${this.version}`
            );
        } catch (error) {
            if (this.env.NRFUTIL_HOME && fs.existsSync(this.env.NRFUTIL_HOME)) {
                fs.rmSync(this.env.NRFUTIL_HOME, {
                    recursive: true,
                    force: true,
                });
            }

            getNrfutilLogger()?.error(
                `Error while installing nrfutil-${this.module} version: ${
                    this.version
                }. describeError: ${describeError(error)}`
            );
            throw error;
        }
    };

    public updateNrfUtilCore = async (
        onProgress?: (progress: Progress, task?: Task) => void
    ) => {
        try {
            await this.spawnNrfutil('self-upgrade', [], onProgress);
        } catch (error) {
            // User might not have internet hance fail silently
            getNrfutilLogger()?.error(`Error while updated nrfutil core`);
        }
    };

    public getNrfutilExePath = () => path.join(this.baseDir, 'nrfutil');

    public spawnNrfutilSubcommand = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress, task?: Task) => void,
        onTaskBegin?: (taskBegin: TaskBegin) => void,
        onTaskEnd?: (taskEnd: TaskEnd<Result>) => void,
        controller?: AbortController,
        editEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
    ) =>
        this.spawnNrfutil<Result>(
            this.module,
            [command, ...args],
            onProgress,
            onTaskBegin,
            onTaskEnd,
            controller,
            editEnv
        );

    private spawnNrfutilCommand = (
        command: string,
        args: string[],
        parser: (data: Buffer, pid?: number) => Buffer | undefined,
        onStdError: (data: Buffer, pid?: number) => void,
        controller?: AbortController,
        editEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
    ) =>
        this.spawnCommand(
            this.getNrfutilExePath(),
            [
                command,
                ...args,
                '--json',
                '--log-output=stdout',
                '--log-level',
                this.logLevel,
            ],
            parser,
            onStdError,
            controller,
            editEnv
        );

    private spawnNrfutil = async <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress, task?: Task) => void,
        onTaskBegin?: (taskBegin: TaskBegin) => void,
        onTaskEnd?: (taskEnd: TaskEnd<Result>) => void,
        controller?: AbortController,
        editEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
    ) => {
        const info: Result[] = [];
        const taskEnd: TaskEnd<Result>[] = [];
        let stdErr: string | undefined;
        let pid: number | undefined;

        try {
            await this.spawnNrfutilCommand(
                command,
                args,
                (data, processId) =>
                    commonParser<Result>(
                        data,
                        {
                            onProgress,
                            onTaskBegin,
                            onTaskEnd: end => {
                                taskEnd.push(end);
                                onTaskEnd?.(end);
                            },
                            onInfo: i => {
                                info.push(i);
                            },
                            onLogging: logging => {
                                this.onLoggingHandlers.forEach(onLogging => {
                                    onLogging(logging, processId);
                                });
                            },
                        },
                        processId
                    ),
                (data, processId) => {
                    pid = processId;
                    stdErr = (stdErr ?? '') + data.toString();
                },
                controller,
                editEnv
            );

            if (
                stdErr ||
                taskEnd.filter(end => end.result === 'fail').length > 0
            )
                throw new Error('Task failed.');

            return { taskEnd, info };
        } catch (e) {
            const error = e as Error;

            const addPunctuation = (str: string) =>
                str.endsWith('.') ? str.trim() : `${str.trim()}.`;

            if (stdErr) {
                error.message += `\n${addPunctuation(stdErr)}`;
            }

            const taskEndErrorMsg = taskEnd
                .filter(end => end.result === 'fail' && !!end.message)
                .map(end =>
                    end.message ? `Message: ${addPunctuation(end.message)}` : ''
                )
                .join('\n');

            if (taskEndErrorMsg) {
                error.message += `\n${taskEndErrorMsg}`;
            }

            error.message = error.message.replaceAll('Error: ', '');
            telemetry.sendErrorReport(
                `${
                    pid && this.logLevel === 'trace' ? `[PID:${pid}] ` : ''
                }${describeError(error)}`
            );
            throw error;
        }
    };

    public spawnCommand = (
        command: string,
        args: string[],
        parser: (data: Buffer, pid?: number) => Buffer | undefined,
        onStdError: (data: Buffer, pid?: number) => void,
        controller?: AbortController,
        editEnv: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv = env => env
    ) =>
        new Promise<void>((resolve, reject) => {
            if (controller?.signal.aborted) {
                reject(
                    new Error(
                        `Aborted before start executing nrfutil ${command} ${JSON.stringify(
                            args
                        )}`
                    )
                );
                return;
            }
            let aborting = false;
            telemetry.sendEvent(`running nrfutil ${this.module}`, {
                args,
                exec: command,
            });
            const nrfutil = spawn(command, args, {
                env: editEnv(this.env),
            });

            const listener = () => {
                getNrfutilLogger()?.info(
                    `Aborting ongoing nrfutil ${
                        this.module
                    } ${command} ${JSON.stringify(args)}`
                );
                aborting = true;
                if (nrfutil.pid) {
                    treeKill(nrfutil.pid);
                } else {
                    nrfutil.kill('SIGINT');
                }
            };

            controller?.signal.addEventListener('abort', listener);

            let buffer = Buffer.from('');

            nrfutil.stdout.on('data', (data: Buffer) => {
                if (controller?.signal.aborted) return;

                buffer = Buffer.concat([buffer, data]);
                const remainingBytes = parser(buffer, nrfutil.pid);
                if (remainingBytes) {
                    buffer = remainingBytes;
                } else {
                    buffer = Buffer.from('');
                }
            });

            nrfutil.stderr.on('data', (data: Buffer) => {
                onStdError(data, nrfutil.pid);
            });

            nrfutil.on('error', err => {
                reject(err);
            });

            nrfutil.on('close', code => {
                controller?.signal.removeEventListener('abort', listener);
                if (aborting) {
                    reject(
                        new Error(
                            `Aborted ongoing nrfutil ${command} ${JSON.stringify(
                                args
                            )}`
                        )
                    );
                    return;
                }

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Failed with exit code ${code}.`));
                }
            });
        });

    public execNrfutilSubcommand = <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress, task?: Task) => void,
        onTaskBegin?: (taskBegin: TaskBegin) => void,
        onTaskEnd?: (taskEnd: TaskEnd<Result>) => void,
        controller?: AbortController,
        editEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
    ) =>
        this.execNrfutilCommand<Result>(
            this.module,
            [command, ...args],
            onProgress,
            onTaskBegin,
            onTaskEnd,
            controller,
            editEnv
        );

    private execNrfutilCommand = async <Result>(
        command: string,
        args: string[],
        onProgress?: (progress: Progress, task?: Task) => void,
        onTaskBegin?: (taskBegin: TaskBegin) => void,
        onTaskEnd?: (taskEnd: TaskEnd<Result>) => void,
        controller?: AbortController,
        editEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
    ) => {
        const info: Result[] = [];
        const taskEnd: TaskEnd<Result>[] = [];
        let stdErr: string | undefined;
        let pid: number | undefined;

        try {
            await this.execCommand(
                command,
                args,
                (data, processId) =>
                    commonParser<Result>(
                        data,
                        {
                            onProgress,
                            onTaskBegin,
                            onTaskEnd: end => {
                                taskEnd.push(end);
                                onTaskEnd?.(end);
                            },
                            onInfo: i => {
                                info.push(i);
                            },
                            onLogging: logging => {
                                this.onLoggingHandlers.forEach(onLogging => {
                                    onLogging(logging, processId);
                                });
                            },
                        },
                        processId
                    ),
                (data, processId) => {
                    pid = processId;
                    stdErr = (stdErr ?? '') + data.toString();
                },
                controller,
                editEnv
            );

            if (
                stdErr ||
                taskEnd.filter(end => end.result === 'fail').length > 0
            )
                throw new Error('Task failed.');

            return { taskEnd, info };
        } catch (e) {
            const error = e as Error;

            const addPunctuation = (str: string) =>
                str.endsWith('.') ? str.trim() : `${str.trim()}.`;

            if (stdErr) {
                error.message += `\n${addPunctuation(stdErr)}`;
            }

            const taskEndErrorMsg = taskEnd
                .filter(end => end.result === 'fail' && !!end.message)
                .map(end =>
                    end.message ? `Message: ${addPunctuation(end.message)}` : ''
                )
                .join('\n');

            if (taskEndErrorMsg) {
                error.message += `\n${taskEndErrorMsg}`;
            }

            error.message = error.message.replaceAll('Error: ', '');
            telemetry.sendErrorReport(
                `${
                    pid && this.logLevel === 'trace' ? `[PID:${pid}] ` : ''
                }${describeError(error)}`
            );
            throw error;
        }
    };

    public execCommand = (
        command: string,
        args: string[],
        onData: (data: Buffer, pid?: number) => void,
        onStdError: (data: Buffer, pid?: number) => void,
        controller?: AbortController,
        editEnv: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv = env => env
    ) =>
        new Promise<void>((resolve, reject) => {
            let aborting = false;
            telemetry.sendEvent(`running nrfutil ${this.module}`, {
                args,
                exec: command,
            });

            const nrfutil = exec(`"${command}" ${args.join(' ')}`, {
                env: editEnv(this.env),
            });

            const listener = () => {
                getNrfutilLogger()?.info(
                    `Aborting ongoing nrfutil ${
                        this.module
                    } ${command} ${JSON.stringify(args)}`
                );
                aborting = true;
                if (nrfutil.pid) {
                    treeKill(nrfutil.pid);
                } else {
                    nrfutil.kill('SIGINT');
                }
            };

            controller?.signal.addEventListener('abort', listener);

            nrfutil.stdout?.on('data', (data: Buffer) => {
                if (controller?.signal.aborted) return;

                onData(data, nrfutil.pid);
            });

            nrfutil.stderr?.on('data', (data: Buffer) => {
                onStdError(data, nrfutil.pid);
            });

            nrfutil.on('close', code => {
                controller?.signal.removeEventListener('abort', listener);
                if (aborting) {
                    reject(
                        new Error(
                            `Aborted ongoing nrfutil ${command} ${
                                args[0] ?? ''
                            }`
                        )
                    );
                    return;
                }

                if (code === 0) {
                    resolve();
                } else {
                    reject(new Error(`Failed with exit code ${code}.`));
                }
            });
        });

    public spawnBackgroundSubcommand = <Result>(
        command: string,
        args: string[],
        processors: BackgroundTask<Result>,
        editEnv?: (env: NodeJS.ProcessEnv) => NodeJS.ProcessEnv
    ) => {
        const controller = new AbortController();
        let running = true;
        const closedHandlers: ((error?: Error) => void)[] = [];

        const operation = this.spawnNrfutilCommand(
            this.module,
            [command, ...args],
            (data, pid) => {
                const parsedData: NrfutilJson<Result>[] | undefined =
                    parseJsonBuffers(data);

                if (!parsedData) {
                    return data;
                }

                parsedData.forEach(item => {
                    if (!this.processLoggingData(item, pid)) {
                        if (item.type === 'info') {
                            processors.onData(item.data);
                        }
                    }
                });
            },
            (data, pid) => {
                processors.onError(new Error(data.toString()), pid);
            },
            controller,
            editEnv
        );

        operation
            .then(() => {
                running = false;
                closedHandlers.forEach(callback => callback());
            })
            .catch(error => {
                telemetry.sendErrorReport(describeError(error));
                running = false;
                closedHandlers.forEach(callback => callback(error));
            });

        return {
            stop: (handler?: () => void) => {
                if (handler) closedHandlers.push(handler);
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

    public singleTaskEndOperationWithData = async <T>(
        command: string,
        onProgress?: (progress: Progress, task?: Task) => void,
        controller?: AbortController,
        args: string[] = []
    ) => {
        const data = await this.singleTaskEndOperationOptionalData<T>(
            command,
            onProgress,
            controller,
            args
        );

        if (data != null) {
            return data;
        }
        throw new Error('Unexpected result');
    };

    public singleTaskEndOperationOptionalData = async <T = void>(
        command: string,
        onProgress?: (progress: Progress, task?: Task) => void,
        controller?: AbortController,
        args: string[] = []
    ) => {
        const results = await this.spawnNrfutilSubcommand<T>(
            command,
            args,
            onProgress,
            undefined,
            undefined,
            controller
        );

        if (results.taskEnd.length === 1) {
            return results.taskEnd[0].data ?? results.taskEnd[0].task.data;
        }
        throw new Error('Unexpected result');
    };

    public singleInfoOperationOptionalData = async <T = void>(
        command: string,
        controller?: AbortController,
        args: string[] = []
    ) => {
        const results = await this.spawnNrfutilSubcommand<T>(
            command,
            args,
            undefined,
            undefined,
            undefined,
            controller
        );

        if (results.info.length === 1) {
            return results.info[0];
        }
        throw new Error('Unexpected result');
    };

    public onLogging = (
        handler: (logging: LogMessage, pid?: number) => void
    ) => {
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
    onProgress?: (progress: Progress, task?: Task) => void
) => {
    const sandbox = new NrfutilSandbox(
        baseDir,
        module,
        versionToInstall(module, version)
    );

    onProgress?.(convertNrfutilProgress({ progressPercentage: 0 }));
    const result = await sandbox.isSandboxInstalled();

    if (!result) {
        await sandbox.prepareSandbox(onProgress);
    } else {
        // update nrfutil core
        await sandbox.updateNrfUtilCore(onProgress);
    }

    onProgress?.(convertNrfutilProgress({ progressPercentage: 100 }));
    return sandbox;
};

const convertNrfutilProgress = (progress: NrfutilProgress): Progress => {
    const amountOfSteps = progress.amountOfSteps ?? 1;
    const step = progress.step ?? 1;

    const singleStepWeight = (1 / amountOfSteps) * 100;

    const totalProgressPercentage =
        singleStepWeight * (step - 1) +
        progress.progressPercentage / amountOfSteps;

    return {
        ...progress,
        stepProgressPercentage: progress.progressPercentage,
        totalProgressPercentage,
        amountOfSteps,
        step,
    };
};
