/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { SPLAT } from 'triple-beam';
import winston, { createLogger, format, LogEntry, transports } from 'winston';
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
    getAndClearEntries: () => LogEntry[];
    openLogFile: () => void;
}

const logger = createLogger({
    format: format.combine(
        format(info => ({
            ...info,
            message: info[SPLAT]
                ? `${info.message} ${info[SPLAT].join(' ')}`
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
