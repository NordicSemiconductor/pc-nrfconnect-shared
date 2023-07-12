import { CancelablePromise } from 'cancelable-promise';
import { BackgroundTask, CancellableOperation, LogMessage, NrfUtilSettings, Progress, Version } from './sandboxTypes';
export type NrfutilSandboxType = ReturnType<typeof NrfutilSandbox>;
declare const NrfutilSandbox: (baseDir: string, module: string, version: string, setting?: NrfUtilSettings) => {
    isSandboxInstalled: () => Promise<boolean>;
    getModuleVersion: () => Promise<Version>;
    prepareSandbox: (onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    execSubcommand: <Result>(command: string, args: string[], onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Result>;
    execBackgroundSubcommand: <Result_1>(command: string, args: string[], processors: BackgroundTask<Result_1>) => CancellableOperation;
    onLogging: (handler: (logging: LogMessage) => void) => () => ((logging: LogMessage) => void)[];
};
export default NrfutilSandbox;
