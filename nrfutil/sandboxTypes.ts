/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface BackgroundTask<T> {
    onError: (error: Error) => void;
    onData: (data: T) => void;
}

export type LogLevel = 'off' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export type Task = {
    id: string;
    description: string;
    name: string;
    data: {
        serialNumber: string;
    };
};

export type TaskError = {
    code: number;
    description: string;
};

export type TaskBegin = {
    task: Task;
};

export type TaskEnd<T = void> = {
    task: Task;
    message?: string;
    result?: 'success' | 'fail';
    error?: TaskError;
    name: string;
    data?: T;
};

export type TaskProgress = {
    task: Task;
    progress: Progress;
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
    | {
          type: 'info';
          data: T;
      }
    | NrfutilJsonBegin
    | NrfutilJsonEnd<T>
    | NrfutilJsonProgress
    | NrfutilJsonLog
    | NrfutilJsonBatchUpdate<T>;

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
    level: 'OFF' | 'ERROR' | 'WARN' | 'INFO' | 'DEBUG' | 'TRACE' | 'CRITICAL';
    message: string;
};
