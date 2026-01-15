/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type LogEntry } from 'winston';

import { setVerboseLogging } from '../../nrfutil/modules';
import logger from '../logging';
import type { AppThunk, RootState } from '../store';
import {
    getIsLoggingVerbose,
    persistIsLoggingVerbose,
} from '../utils/persistentStore';

const MAX_ENTRIES = 1000;

export interface Log {
    autoScroll: boolean;
    logEntries: LogEntry[];
    isLoggingVerbose: boolean;
}

const initialState: Log = {
    autoScroll: true,
    logEntries: [],
    isLoggingVerbose: getIsLoggingVerbose(),
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
export const isLoggingVerbose = (state: RootState) =>
    state.log.isLoggingVerbose;

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
        setIsLoggingVerbose: (state, action: PayloadAction<boolean>) => {
            state.isLoggingVerbose = action.payload;
        },
    },
});

export const {
    reducer,
    actions: { addEntries, clear, toggleAutoScroll },
} = slice;

export const setIsLoggingVerbose =
    (enable: boolean): AppThunk =>
    dispatch => {
        try {
            setVerboseLogging(enable);
        } catch (e) {
            logger.error(
                'Failed to enable verbose logging to nRF Util modules.',
                e,
            );
        }
        persistIsLoggingVerbose(enable);
        dispatch(slice.actions.setIsLoggingVerbose(enable));
    };
