/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import logger from '../logging';
import sendInitialLogMessages from '../logging/sendInitialLogMessages';
import LogEntry from './LogEntry';
import {
    autoScroll as autoScrollSelector,
    logEntries as logEntriesSelector,
} from './logSlice';
import startSyncLogToStore from './syncLogToStore';

import './log-viewer.scss';

export const useInitialisedLog = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        logger.initialise();
        sendInitialLogMessages();
        const stopSyncLogToStore = startSyncLogToStore(dispatch);

        return stopSyncLogToStore;
    }, [dispatch]);
};

export default () => {
    useInitialisedLog();

    const autoScroll = useSelector(autoScrollSelector);
    const logEntries = useSelector(logEntriesSelector);
    const logContainer = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (autoScroll && logContainer.current?.lastChild) {
            (logContainer.current?.lastChild as Element).scrollIntoView();
        }
    });

    return (
        <div ref={logContainer} className="core19-log">
            {logEntries.map(entry => (
                <LogEntry entry={entry} key={entry.id} />
            ))}
        </div>
    );
};
