/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { convertNrfutilProgress, parseJsonBuffers } from './common';
import type {
    NrfutilJson,
    OnLog,
    OnProgress,
    OnTaskBegin,
    OnTaskEnd,
    TaskEnd,
} from './sandboxTypes';

const addPunctuation = (str: string) =>
    str.endsWith('.') ? str.trim() : `${str.trim()}.`;

export default class CollectingResultParser<Result> {
    private readonly info: Result[] = [];
    private readonly taskEnd: TaskEnd<Result>[] = [];

    constructor(
        private onLog: OnLog,
        private onProgress?: OnProgress,
        private onTaskBegin?: OnTaskBegin,
        private onTaskEnd?: OnTaskEnd<Result>,
    ) {}

    public handleData = (data: Buffer, pid?: number) => {
        const parsedData: NrfutilJson<Result>[] | undefined =
            parseJsonBuffers(data);

        if (!parsedData) {
            return data;
        }

        const processItem = (item: NrfutilJson<Result>) => {
            switch (item.type) {
                case 'task_progress':
                    this.onProgress?.(
                        convertNrfutilProgress(item.data.progress),
                        item.data.task,
                    );
                    break;
                case 'task_begin':
                    this.onTaskBegin?.(item.data);
                    break;
                case 'task_end':
                    this.taskEnd.push(item.data);
                    this.onTaskEnd?.(item.data);
                    break;
                case 'info':
                    this.info.push(item.data);
                    break;
                case 'log':
                    this.onLog(item.data, pid);
                    break;
                case 'batch_update':
                    processItem(item.data.data);
                    break;
            }
        };

        parsedData.forEach(processItem);
    };

    public hasFailures = () =>
        this.taskEnd.filter(({ result }) => result === 'fail').length > 0;

    public errorMessage = () =>
        this.taskEnd
            .filter(end => end.result === 'fail' && !!end.message)
            .map(end =>
                end.message ? `Message: ${addPunctuation(end.message)}` : '',
            )
            .join('\n');

    public result = () => ({ taskEnd: this.taskEnd, info: this.info });
}
