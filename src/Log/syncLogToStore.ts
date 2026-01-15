/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import logger from '../logging';
import { type AppDispatch } from '../store';
import { addEntries } from './logSlice';

const addLogEntriesToStore = (dispatch: AppDispatch) => () => {
    const entries = logger.getAndClearEntries();
    if (entries.length > 0) {
        dispatch(addEntries(entries));
    }
};

/**
 * Starts syncing to new log entries from the application's log buffer.
 * Incoming entries are added to the state, so that they can be displayed
 * in the UI.
 *
 * @param {function} dispatch The redux dispatch function.
 * @returns {function(*)} Function that stops the listener.
 */
export default (dispatch: AppDispatch) => {
    const LOG_UPDATE_INTERVAL = 400;
    const logListener = setInterval(
        addLogEntriesToStore(dispatch),
        LOG_UPDATE_INTERVAL,
    );

    return () => {
        clearInterval(logListener);
    };
};
