/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import LogEntry from './LogEntry';
import { useLogListener } from './logListener';
import {
    autoScroll as autoScrollSelector,
    logEntries as logEntriesSelector,
} from './logSlice';

import './log-viewer.scss';

export default () => {
    useLogListener();

    const autoScroll = useSelector(autoScrollSelector);
    const logEntries = useSelector(logEntriesSelector);
    const logContainer = useRef(null);

    useEffect(() => {
        if (autoScroll && logContainer.current.lastChild) {
            logContainer.current.lastChild.scrollIntoView();
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
