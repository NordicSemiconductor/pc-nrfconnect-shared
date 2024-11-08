/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { DiscriminatedVersion } from './version';

export interface BackgroundTask<T> {
    onError: (error: Error, pid?: number) => void;
    onData: (data: T) => void;
}

export type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type FeatureClassification =
    | 'nrf-internal-confidential'
    | 'nrf-internal'
    | 'nrf-external-confidential'
    | 'nrf-external';

export type Task<T = undefined | null> = {
    id: string;
    description: string;
    name: string;
    data: T;
};

export type TaskError = {
    code: number;
    description: string;
};

export type TaskBegin = {
    task: Task;
};

export type TaskEnd<T = undefined | null> = {
    task: Task<T>;
    message?: string;
    result?: 'success' | 'fail';
    error?: TaskError;
    data?: T;
};

export type NrfutilProgress = {
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

export type TaskProgress = {
    task: Task;
    progress: NrfutilProgress;
};

type NrfutilJsonProgress = {
    type: 'task_progress';
    data: TaskProgress;
};

type NrfutilJsonLog = {
    type: 'log';
    data: LogMessage;
};

type NrfutilJsonEnd<T> = {
    type: 'task_end';
    data: TaskEnd<T>;
};

type NrfutilJsonBegin = {
    type: 'task_begin';
    data: TaskBegin;
};

type NrfutilJsonInfo<T> = {
    type: 'info';
    data: T;
};

type NrfutilJsonBatch<T = unknown> = {
    batch: {
        id: string;
        data: {
            serialNumber: string;
        };
    };
    data: NrfutilJson<T>;
};

export type NrfutilJsonBatchUpdate<T = unknown> = {
    type: 'batch_update';
    data: NrfutilJsonBatch<T>;
};

export type NrfutilJson<T = unknown> =
    | NrfutilJsonInfo<T>
    | NrfutilJsonBegin
    | NrfutilJsonEnd<T>
    | NrfutilJsonProgress
    | NrfutilJsonLog
    | NrfutilJsonBatchUpdate<T>;

export type Progress = {
    totalProgressPercentage: number;
    stepProgressPercentage: number;
    message?: string;
    description?: string;
    amountOfSteps: number;
    duration?: number;
    name?: string;
    operation?: string;
    result?: string;
    state?: string;
    step: number;
};

export type LogMessage = {
    level: 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'CRITICAL';
    message: string;
};

type Plugin = DiscriminatedVersion & {
    dependencies: TopLevelDependency[];
    name: string;
};

type DependencyWithoutVersion = {
    name: string;
    dependencies?: SubDependency[];
    expectedVersion?: DiscriminatedVersion;
};
type DependencyWithVersion = DiscriminatedVersion & DependencyWithoutVersion;

export type Dependency = DependencyWithoutVersion | DependencyWithVersion;

export type TopLevelDependency = Dependency & {
    classification?: FeatureClassification;
    plugins?: Plugin[];
};

export type SubDependency = Dependency & {
    description?: string;
};

export type ModuleVersion = {
    build_timestamp: string;
    classification: FeatureClassification;
    commit_date: string;
    commit_hash: string;
    dependencies: TopLevelDependency[];
    host: string;
    name: string;
    version: string;
};

export const hasVersion = (
    dependency?: Dependency | DiscriminatedVersion
): dependency is DependencyWithVersion | DiscriminatedVersion =>
    dependency != null && 'version' in dependency && dependency.version != null;
