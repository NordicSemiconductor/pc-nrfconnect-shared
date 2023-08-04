import { BackgroundTask, LogLevel, LogMessage, ModuleVersion, Progress } from './sandboxTypes';
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
    prepareSandbox: (onProgress?: ((progress: Progress) => void) | undefined) => Promise<void>;
    private execNrfutil;
    private execSubcommand;
    private execCommand;
    execBackgroundSubcommand: <Result>(command: string, args: string[], processors: BackgroundTask<Result>) => {
        stop: (handler: () => void) => void;
        isRunning: () => boolean;
        onClosed: (handler: (error?: Error) => void) => () => ((error?: Error) => void)[];
    };
    singleTaskEndOperation: <T = void>(command: string, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController, args?: string[]) => Promise<NonNullable<T>>;
    onLogging: (handler: (logging: LogMessage) => void) => () => ((logging: LogMessage) => void)[];
    setLogLevel: (level: LogLevel) => void;
}
declare const _default: (baseDir: string, module: string, version?: string) => Promise<NrfutilSandbox>;
export default _default;
//# sourceMappingURL=sandbox.d.ts.map