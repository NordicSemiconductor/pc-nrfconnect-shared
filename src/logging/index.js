/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';
import { SPLAT } from 'triple-beam';
import { createLogger, format, transports } from 'winston';

import { openFile } from '../utils/open';
import AppTransport from './appTransport';
import ConsoleTransport from './consoleTransport';
import createLogBuffer from './logBuffer';

const filePrefix = new Date().toISOString().replace(/:/gi, '_');
let logFilePath;

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

const logTransports = [
    new AppTransport({
        name: 'app',
        level: 'info',
        onLogEntry: logBuffer.addEntry,
    }),
];

if (isDevelopment && isConsoleAvailable) {
    logTransports.push(
        new ConsoleTransport({
            name: 'console',
            level: 'silly',
            debugStdout: false,
            stderrLevels: [
                'silly',
                'debug',
                'verbose',
                'info',
                'warn',
                'error',
            ],
        })
    );
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
});

logger.addFileTransport = appLogDir => {
    logFilePath = path.join(appLogDir, `${filePrefix}-log.txt`);
    const fileTransport = new transports.File({
        name: 'file',
        filename: logFilePath,
        level: 'debug',
    });
    logger.add(fileTransport, {}, true);
};

logger.getAndClearEntries = () => logBuffer.clear();

logger.openLogFile = () => {
    try {
        openFile(logFilePath);
    } catch (error) {
        logger.error(`Unable to open log file: ${error.message}`);
    }
};

export default logger;
