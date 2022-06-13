/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TransformableInfo } from 'logform';
import path from 'path';
import { SPLAT } from 'triple-beam';
import { createLogger, format, LogEntry, Logger, transports } from 'winston';
import Transport from 'winston-transport';

import { getAppLogDir } from '../utils/appDirs';
import { openFile } from '../utils/open';
import AppTransport from './appTransport';
import describeError from './describeError';
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

if (isDevelopment && isConsoleAvailable) {
    logTransports.push(new transports.Console({ level: 'silly' }));
}

interface SharedLogger extends Logger {
    initialise: () => void;
    getAndClearEntries: () => LogEntry[];
    openLogFile: () => void;
    logError: (message: string, error: unknown) => void;
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

logger.initialise = () => {
    logFilePath = path.join(getAppLogDir(), `${filePrefix}-log.txt`);

    logger.add(
        new transports.File({
            filename: logFilePath,
            level: 'debug',
        })
    );
};

logger.getAndClearEntries = () => logBuffer.clear();

logger.openLogFile = () => {
    try {
        openFile(logFilePath);
    } catch (error) {
        logger.logError('Unable to open log file', error);
    }
};

logger.logError = (message: string, error: unknown) => {
    const errorMessage =
        error == null ? message : `${message}: ${describeError(error)}`;

    logger.error(errorMessage);
};

export default logger;
