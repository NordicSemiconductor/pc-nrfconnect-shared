/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ADD_ENTRIES, CLEAR_ENTRIES, TOGGLE_AUTOSCROLL } from './logActions';

const MAX_ENTRIES = 1000;

const initialState = {
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

const limitedToMaxSize = entries =>
    entries.length <= MAX_ENTRIES
        ? entries
        : [infoEntry(), ...entries.slice(-MAX_ENTRIES)];

export default (state = initialState, action) => {
    switch (action.type) {
        case ADD_ENTRIES: {
            return {
                ...state,
                logEntries: limitedToMaxSize([
                    ...state.logEntries,
                    ...action.entries,
                ]),
            };
        }
        case CLEAR_ENTRIES:
            return { ...state, logEntries: [] };
        case TOGGLE_AUTOSCROLL:
            return { ...state, autoScroll: !state.autoScroll };
        default:
            return state;
    }
};

export const autoScroll = state => state.log.autoScroll;
export const logEntries = state => state.log.logEntries;
