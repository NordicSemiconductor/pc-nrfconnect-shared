export type WithRequired<T, K extends keyof T> = T & {
    [P in K]-?: T[P];
};
export type CancellableOperation = {
    stop: (callback?: (code: number | null) => void) => void;
    isRunning: () => boolean;
    onClosed: (handler: (code: number | null) => void) => () => void;
};
export interface BackgroundTask<T> {
    onError: (error: Error) => void;
    onData: (data: T) => void;
}
export type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export type FeatureClassification = 'nrf-internal-confidential' | 'nrf-internal' | 'nrf-external-confidential' | 'nrf-external';
export type Task = {
    id: string;
    description: string;
    name: string;
};
export type TaskEnd<T = void> = {
    task: Task;
    message?: string;
    result?: 'success' | 'fail';
    error?: {
        code: number;
        description: string;
    };
    name: string;
    data?: T;
};
export type TaskProgress = {
    task: Task;
    progress: Progress;
};
export type NrfutilJson<T> = {
    type: 'task_begin' | 'task_progress' | 'task_end' | 'info' | 'log';
    data: T;
};
export type Progress = {
    progressPercentage: number;
    message?: string;
    description?: string;
    amountOfSteps?: number;
    duration?: number;
    name?: string;
    operation?: string;
    result?: string;
    state?: string;
    step?: number;
};
export type LogMessage = {
    level: 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE';
    message: string;
};
export interface SemanticVersion {
    major: number;
    minor: number;
    patch: number;
    semverPreNumeric?: number;
    semverPreAlphaNumeric?: number;
    semverMetadataNumeric?: number;
    semverMetadataAlphaNumeric?: number;
}
type VersionFormat = 'incremental' | 'semantic' | 'string';
type Plugin = {
    dependencies: Dependencies[];
    versionFormat: VersionFormat;
    version: {
        name: string;
        description?: string;
        dependencies?: Dependencies[];
        versionFormat: VersionFormat;
        version: SemanticVersion | string | number;
    };
};
type Dependencies = {
    classification: FeatureClassification;
    name: string;
    plugins?: Plugin[];
    dependencies?: Dependencies[];
    versionFormat: VersionFormat;
    version: {
        name: string;
        description?: string;
        dependencies?: Dependencies[];
        versionFormat: VersionFormat;
        version: SemanticVersion | string | number;
    };
};
export type Version = {
    build_timestamp: string;
    classification: FeatureClassification;
    commit_date: string;
    commit_hash: string;
    dependencies: Dependencies[];
    host: string;
    name: string;
    version: string;
};
export type NrfUtilSettings = {
    logLevel: LogLevel;
    bootstrapConfigUrl?: string;
    bootstrapTarballPath?: string;
    devicePluginsDirForceNrfdlLocation?: string;
    devicePluginsDirForceNrfutilLocation?: string;
    ignoreMissingSubCommand?: string;
    log?: string;
    packageIndexUrl?: string;
};
export {};
