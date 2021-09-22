/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Log, LogEntry, RootState } from '../state';

const MAX_ENTRIES = 1000;

const initialState: Log = {
    autoScroll: true,
    logEntries: [],
};

const infoEntry = () => ({
    id: -1,
    level: 'info',
    timestamp: new Date().toISOString(),
    message:
        'The log in this view has been shortened. Open the log file to see the full content.',
});

const limitedToMaxSize = (entries: LogEntry[]) =>
    entries.length <= MAX_ENTRIES
        ? entries
        : [infoEntry(), ...entries.slice(-MAX_ENTRIES)];

export const autoScroll = (state: RootState) => state.log.autoScroll;
export const logEntries = (state: RootState) => state.log.logEntries;

const slice = createSlice({
    name: 'log',
    initialState,
    reducers: {
        addEntries: (state, action: PayloadAction<LogEntry[]>) => {
            state.logEntries = limitedToMaxSize([
                ...state.logEntries,
                ...action.payload,
            ]);
        },
        clear: state => {
            state.logEntries = [];
        },
        toggleAutoScroll: state => {
            state.autoScroll = !state.autoScroll;
        },
    },
});

export const {
    reducer,
    actions: { addEntries, clear, toggleAutoScroll },
} = slice;
