/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from '@electron/remote';
import {
    createContext,
    Error,
    LogEvent,
    ModuleVersion,
    setLogLevel,
    setLogPattern,
    setTimeoutConfig,
    startLogEvents,
    stopLogEvents,
} from '@nordicsemiconductor/nrf-device-lib-js';
import path from 'path';

import { isLoggingVerbose } from '../Log/logSlice';
import logger from '../logging';
import {
    getIsLoggingVerbose,
    persistIsLoggingVerbose,
} from '../utils/persistentStore';

let deviceLibContext = 0;
export const getDeviceLibContext = () => {
    if (deviceLibContext === 0) initDeviceLib();

    return deviceLibContext;
};

const initDeviceLib = () => {
    if (process.platform === 'win32') {
        const binariesPath = app.getAppPath().endsWith('app.asar')
            ? `${app.getAppPath()}.unpacked`
            : app.getAppPath();
        deviceLibContext = createContext({
            plugins_dir: path.join(
                binariesPath,
                'node_modules',
                '@nordicsemiconductor',
                'nrf-device-lib-js',
                'Release'
            ),
        });
    } else {
        deviceLibContext = createContext();
    }

    setTimeoutConfig(getDeviceLibContext(), {
        enumerateMs: 3 * 60 * 1000,
    });
};

export const logNrfdlLogs = (evt: LogEvent) => {
    if (process.env.NODE_ENV === 'production' && !isLoggingVerbose()) return;
    switch (evt.level) {
        case 'NRFDL_LOG_TRACE':
            logger.verbose(evt.message);
            break;
        case 'NRFDL_LOG_DEBUG':
            logger.debug(evt.message);
            break;
        case 'NRFDL_LOG_INFO':
            logger.info(evt.message);
            break;
        case 'NRFDL_LOG_WARNING':
            logger.warn(evt.message);
            break;
        case 'NRFDL_LOG_ERROR':
            logger.error(evt.message);
            break;
        case 'NRFDL_LOG_CRITICAL':
            logger.error(evt.message);
            break;
    }
};

export const forwardLogEventsFromDeviceLib = () => {
    setLogPattern(getDeviceLibContext(), '[%n][%l](%T.%e) %v');
    setVerboseDeviceLibLogging(getIsLoggingVerbose());

    // Only the first reset after selecting "reset with verbose logging" is relevant
    persistIsLoggingVerbose(false);

    const taskId = startLogEvents(
        getDeviceLibContext(),
        (err?: Error) => {
            if (err)
                logger.logError(
                    'Error while listening to log messages from nrf-device-lib',
                    err
                );
        },
        (evt: LogEvent) => logNrfdlLogs(evt)
    );
    return () => {
        stopLogEvents(taskId);
    };
};

export const setVerboseDeviceLibLogging = (verboseLogging: boolean) =>
    setLogLevel(
        getDeviceLibContext(),
        verboseLogging ? 'NRFDL_LOG_TRACE' : 'NRFDL_LOG_ERROR'
    );

type KnownModule = 'nrfdl' | 'nrfdl-js' | 'jprog' | 'JlinkARM';

const findTopLevel = (module: KnownModule, versions: ModuleVersion[]) =>
    versions.find(version => version.name === module);

const findInDependencies = (module: KnownModule, versions: ModuleVersion[]) => {
    if (versions.length > 0) {
        return getModuleVersion(
            module,
            versions.flatMap(version => [
                ...(version.dependencies ?? []),
                ...((version.plugins as ModuleVersion[]) ?? []),
            ])
        );
    }
};

export const getModuleVersion = (
    module: KnownModule,
    versions: ModuleVersion[] = []
): ModuleVersion | undefined =>
    findTopLevel(module, versions) ?? findInDependencies(module, versions);
