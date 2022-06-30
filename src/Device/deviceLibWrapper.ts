/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

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

import { isLoggingVerbose } from '../Log/logSlice';
import logger from '../logging';
import { RootState, TDispatch } from '../state';
import { getIsLoggingVerbose } from '../utils/persistentStore';

const deviceLibContext = createContext();
export const getDeviceLibContext = () => deviceLibContext;

export const logNrfdlLogs =
    (evt: LogEvent) => (_: unknown, getState: () => RootState) => {
        if (
            process.env.NODE_ENV === 'production' &&
            !isLoggingVerbose(getState())
        )
            return;
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

export const forwardLogEventsFromDeviceLib = (dispatch: TDispatch) => {
    const taskId = startLogEvents(
        getDeviceLibContext(),
        (err?: Error) => {
            if (err)
                logger.logError(
                    'Error while listening to log messages from nrf-device-lib',
                    err
                );
        },
        (evt: LogEvent) => dispatch(logNrfdlLogs(evt))
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

type KnownModule = 'nrfdl' | 'nrfdl-js' | 'jprog' | 'jlink';

const findTopLevel = (module: KnownModule, versions: ModuleVersion[]) =>
    versions.find(version => version.moduleName === module);

const findInDependencies = (module: KnownModule, versions: ModuleVersion[]) =>
    getModuleVersion(
        module,
        versions.flatMap(version => version.dependencies ?? [])
    );

export const getModuleVersion = (
    module: KnownModule,
    versions: ModuleVersion[] = []
): ModuleVersion | undefined =>
    findTopLevel(module, versions) ?? findInDependencies(module, versions);

setLogPattern(getDeviceLibContext(), '[%n][%l](%T.%e) %v');
setVerboseDeviceLibLogging(getIsLoggingVerbose());
setTimeoutConfig(deviceLibContext, {
    enumerateMs: 3 * 60 * 1000,
});
