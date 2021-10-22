/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TransformableInfo } from 'logform';
import path from 'path';
import { SPLAT } from 'triple-beam';
import winston, { createLogger, format, transports } from 'winston';
import Transport from 'winston-transport';

import { openFile } from '../utils/open';
import AppTransport from './appTransport';
import ConsoleTransport from './consoleTransport';
import createLogBuffer from './logBuffer';

const filePrefix = new Date().toISOString().replace(/:/gi, '_');
let logFilePath: string;

const isDevelopment = process.env.NODE_ENV === 'development';
const isConsoleAvailable = (() => {
    try {
        process.stdout.write('');
    } catch (error) {
        return false;
    }
    return true;
})();

const logBuffer = createLogBuffer();

const logTransports: Transport[] = [
    new AppTransport({
        level: 'info',
        onLogEntry: logBuffer.addEntry,
    }),
];
transports.Console;
if (isDevelopment && isConsoleAvailable) {
    logTransports.push(
        new ConsoleTransport({
            level: 'silly',
        })
    );
}

interface SharedLogger extends winston.Logger {
    addFileTransport: (appLogDir: string) => void;
    getAndClearEntries: () => void;
    openLogFile: () => void;
}

/* This function is only needed, because our version of TypeScript still seems
   unable to accept (unique) symbols as index types. As soon as we have
   upgraded to a version that is capable of that, the invocations of this
   function can be replaced by a simple `info[splat]` and this function can
   be removed. */
const splat = (info: TransformableInfo) => info[SPLAT as unknown as string];

const logger = createLogger({
    format: format.combine(
        format(info => ({
            ...info,
            message: splat(info)
                ? `${info.message} ${splat(info).join(' ')}`
                : info.message,
        }))(),
        format.timestamp(),
        format.printf(
            ({ timestamp, level, message }) =>
                `${timestamp} ${level.toUpperCase()} ${message || ''}`
        )
    ),
    transports: logTransports,
}) as SharedLogger;

logger.addFileTransport = (appLogDir: string) => {
    logFilePath = path.join(appLogDir, `${filePrefix}-log.txt`);
    const fileTransport = new transports.File({
        filename: logFilePath,
        level: 'debug',
    });
    logger.add(fileTransport);
};

logger.getAndClearEntries = () => logBuffer.clear();

logger.openLogFile = () => {
    try {
        openFile(logFilePath);
    } catch (error) {
        const message = error instanceof Error ? error.message : error;
        if (error instanceof Error) {
            logger.error(`Unable to open log file: ${message}`);
        }
    }
};

export default logger;
