/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LogEntry } from 'winston';
import Transport, { TransportStreamOptions } from 'winston-transport';

interface Options extends TransportStreamOptions {
    onLogEntry: (entry: LogEntry) => void;
}

export default class AppTransport extends Transport {
    private onLogEntry: (entry: LogEntry) => void;
    private entryCount: number;

    constructor(options: Options) {
        super(options);

        if (!options.onLogEntry) {
            throw new Error(
                'Property onLogEntry was not provided to AppTransport'
            );
        }

        this.onLogEntry = options.onLogEntry;
        this.entryCount = 0;
    }

    log({ level, message, timestamp }: LogEntry, next: () => void) {
        this.onLogEntry({
            id: this.entryCount,
            timestamp,
            level,
            message,
        });
        this.entryCount += 1;
        next();
    }
}
