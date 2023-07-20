import { CancelablePromise } from 'cancelable-promise';
import { BackgroundTask, CancellableOperation, LogLevel, LogMessage, ModuleVersion, Progress, TaskEnd } from './sandboxTypes';
export type NrfutilSandboxType = ReturnType<typeof NrfutilSandbox>;
declare const NrfutilSandbox: (baseDir: string, module: string, version: string) => {
    isSandboxInstalled: () => Promise<boolean>;
    getModuleVersion: () => Promise<ModuleVersion>;
    prepareSandbox: (onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    execSubcommand: <Result>(command: string, args: string[], onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<{
        taskEnd: TaskEnd<Result>[];
        info: Result[];
    }>;
    execBackgroundSubcommand: <Result_1>(command: string, args: string[], processors: BackgroundTask<Result_1>) => CancellableOperation;
    onLogging: (handler: (logging: LogMessage) => void) => () => ((logging: LogMessage) => void)[];
    setLogLevel: (level: LogLevel) => void;
};
export declare const prepareSandbox: (baseDir: string, module: string, version?: string) => Promise<{
    isSandboxInstalled: () => Promise<boolean>;
    getModuleVersion: () => Promise<ModuleVersion>;
    prepareSandbox: (onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    execSubcommand: <Result>(command: string, args: string[], onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<{
        taskEnd: TaskEnd<Result>[];
        info: Result[];
    }>;
    execBackgroundSubcommand: <Result_1>(command: string, args: string[], processors: BackgroundTask<Result_1>) => CancellableOperation;
    onLogging: (handler: (logging: LogMessage) => void) => () => ((logging: LogMessage) => void)[];
    setLogLevel: (level: LogLevel) => void;
}>;
export declare const prepareAndCreate: <Module>(baseDir: string, module: string, createModule: (sandbox: NrfutilSandboxType) => Module, version?: string) => Promise<Module>;
export {};
