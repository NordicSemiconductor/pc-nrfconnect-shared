/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Transport from 'winston-transport';

export default class AppTransport extends Transport {
    constructor(options) {
        super(options);

        if (!options.onLogEntry) {
            throw new Error(
                'Property onLogEntry was not provided to AppTransport'
            );
        }

        this.onLogEntry = options.onLogEntry;
        this.entryCount = 0;
    }

    log({ level, message, timestamp }, callback) {
        this.onLogEntry({
            id: this.entryCount,
            timestamp,
            level,
            message,
        });
        this.entryCount += 1;
        callback(null, true);
    }
}
