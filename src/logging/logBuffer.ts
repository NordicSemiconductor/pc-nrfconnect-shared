/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LogEntry } from 'winston';

class LogBuffer {
    entries: LogEntry[] = [];
    addEntry = (entry: LogEntry) => {
        this.entries.push(entry);
    };
    clear() {
        return this.entries.splice(0, this.size());
    }
    size() {
        return this.entries.length;
    }
}

const createLogBuffer = () => new LogBuffer();

export { createLogBuffer as default };
