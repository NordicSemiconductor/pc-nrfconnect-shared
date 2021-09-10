/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { ipcRenderer } from 'electron';

import logger from '../logging';
import { getAppDataDir } from '../utils/appDirs';
import { addEntries } from './logActions';

let initialMessageSent = false;
const sendInitialMessage = () => {
    if (initialMessageSent) return;

    initialMessageSent = true;
    logger.info(`Application data folder: ${getAppDataDir()}`);

    ipcRenderer.once('app-details', (_event, details) => {
        const {
            name,
            currentVersion,
            engineVersion,
            coreVersion,
            corePath,
            isOfficial,
            isSupportedEngine,
            path,
            homeDir,
            tmpDir,
        } = details;
        const official = isOfficial ? 'official' : 'local';
        const supported = isSupportedEngine
            ? 'is supported'
            : 'is not supported';
        logger.debug(`App ${name} v${currentVersion} ${official}`);
        logger.debug(`App path: ${path}`);
        logger.debug(
            `nRFConnect ${coreVersion} ${supported} by the app (${engineVersion})`
        );
        logger.debug(`nRFConnect path: ${corePath}`);
        logger.debug(`HomeDir: ${homeDir}`);
        logger.debug(`TmpDir: ${tmpDir}`);
    });
    ipcRenderer.send('get-app-details');
};

const addLogEntriesToStore = dispatch => () => {
    const entries = logger.getAndClearEntries();
    if (entries.length > 0) {
        dispatch(addEntries(entries));
    }
};

/**
 * Starts listening to new log entries from the application's log buffer.
 * Incoming entries are added to the state, so that they can be displayed
 * in the UI.
 *
 * @param {function} dispatch The redux dispatch function.
 * @returns {function(*)} Function that stops the listener.
 */
function startListening(dispatch) {
    sendInitialMessage();

    const LOG_UPDATE_INTERVAL = 400;
    const logListener = setInterval(
        addLogEntriesToStore(dispatch),
        LOG_UPDATE_INTERVAL
    );

    return () => {
        clearInterval(logListener);
    };
}

// eslint-disable-next-line import/prefer-default-export
export const useLogListener = () => {
    const dispatch = useDispatch();
    useEffect(() => startListening(dispatch), [dispatch]);
};
