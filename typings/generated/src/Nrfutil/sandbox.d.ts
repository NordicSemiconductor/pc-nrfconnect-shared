import { CancelablePromise } from 'cancelable-promise';
import { BackgroundTask, CancellableOperation, LogLevel, LogMessage, ModuleVersion, NrfUtilSettings, Progress } from './sandboxTypes';
export type NrfutilSandboxType = ReturnType<typeof NrfutilSandbox>;
declare const NrfutilSandbox: (baseDir: string, module: string, version: string, setting?: NrfUtilSettings) => {
    isSandboxInstalled: () => Promise<boolean>;
    getModuleVersion: () => Promise<ModuleVersion>;
    prepareSandbox: (onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    execSubcommand: <Result>(command: string, args: string[], onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Result>;
    execBackgroundSubcommand: <Result_1>(command: string, args: string[], processors: BackgroundTask<Result_1>) => CancellableOperation;
    onLogging: (handler: (logging: LogMessage) => void) => () => ((logging: LogMessage) => void)[];
    setLogLevel: (level: LogLevel) => void;
};
export declare const prepareAndCreate: <Module>(baseDir: string, module: string, version: string, createModule: (sandbox: NrfutilSandboxType) => Module, setting?: NrfUtilSettings) => Promise<Module>;
export default NrfutilSandbox;
