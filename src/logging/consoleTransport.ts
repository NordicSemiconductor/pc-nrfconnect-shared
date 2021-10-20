/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { LogEntry } from 'winston';
import Transport from 'winston-transport';

/* eslint-disable class-methods-use-this */

export default class ConsoleTransport extends Transport {
    log({ level, message, timestamp }: LogEntry, next: () => void) {
        console.log(timestamp, level.toUpperCase(), message);
        next();
    }
}
