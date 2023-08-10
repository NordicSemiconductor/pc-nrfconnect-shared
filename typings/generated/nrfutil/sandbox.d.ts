import { BackgroundTask, LogLevel, LogMessage, ModuleVersion, Progress, Task, TaskBegin, TaskEnd } from './sandboxTypes';
declare const prepareEnv: (baseDir: string, module: string, version: string) => {
    [x: string]: string | undefined;
    TZ?: string | undefined;
};
export declare class NrfutilSandbox {
    baseDir: string;
    module: string;
    version: string;
    onLoggingHandlers: ((logging: LogMessage) => void)[];
    logLevel: LogLevel;
    env: ReturnType<typeof prepareEnv>;
    constructor(baseDir: string, module: string, version: string);
    private processLoggingData;
    getModuleVersion: () => Promise<ModuleVersion>;
    isSandboxInstalled: () => Promise<boolean>;
    prepareSandbox: (onProgress?: ((progress: Progress, task?: Task) => void) | undefined) => Promise<void>;
    private execNrfutil;
    execSubcommand: <Result>(command: string, args: string[], onProgress?: ((progress: Progress, task?: Task) => void) | undefined, onTaskBegin?: ((taskBegin: TaskBegin) => void) | undefined, onTaskEnd?: ((taskEnd: TaskEnd<Result>) => void) | undefined, controller?: AbortController) => Promise<{
        taskEnd: TaskEnd<Result>[];
        info: Result[];
    }>;
    private execCommand;
    execBackgroundSubcommand: <Result>(command: string, args: string[], processors: BackgroundTask<Result>) => {
        stop: (handler: () => void) => void;
        isRunning: () => boolean;
        onClosed: (handler: (error?: Error) => void) => () => ((error?: Error) => void)[];
    };
    singleTaskEndOperationWithData: <T>(command: string, onProgress?: ((progress: Progress, task?: Task) => void) | undefined, controller?: AbortController, args?: string[]) => Promise<NonNullable<Awaited<T>>>;
    singleTaskEndOperationOptionalData: <T = void>(command: string, onProgress?: ((progress: Progress, task?: Task) => void) | undefined, controller?: AbortController, args?: string[]) => Promise<T | undefined>;
    onLogging: (handler: (logging: LogMessage) => void) => () => ((logging: LogMessage) => void)[];
    setLogLevel: (level: LogLevel) => void;
}
declare const _default: (baseDir: string, module: string, version?: string, onProgress?: ((progress: Progress, task?: Task) => void) | undefined) => Promise<NrfutilSandbox>;
export default _default;
//# sourceMappingURL=sandbox.d.ts.map