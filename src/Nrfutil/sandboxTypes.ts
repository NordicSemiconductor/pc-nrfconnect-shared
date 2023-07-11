/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface CancellablePromise<T> extends Promise<T> {
    cancel: () => void;
}

export type CancellableOperation = () => Promise<void>;

export interface BackgroundTask<T> {
    onError: (error: Error) => void;
    onData: (data: T) => void;
}

export type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type FeatureClassification =
    | 'nrf-internal-confidential'
    | 'nrf-internal'
    | 'nrf-external-confidential'
    | 'nrf-external';

export type Task = {
    id: string;
    description: string;
    name: string;
};

export type NrfutilJson<T> = {
    type: 'task_begin' | 'task_progress' | 'task_end' | 'task_info' | 'log';
    data: Task & T;
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
    execPath: string;
    bootstrapConfigUrl?: string;
    bootstrapTarballPath?: string;
    devicePluginsDirForceNrfdlLocation?: string;
    devicePluginsDirForceNrfutilLocation?: string;
    ignoreMissingSubCommand?: string;
    log?: string;
    packageIndexUrl?: string;
};
