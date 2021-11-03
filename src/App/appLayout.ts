/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { AppLayout, RootState } from '../state';
import { persistCurrentPane } from '../utils/persistentStore';

const initialState: AppLayout = {
    isSidePanelVisible: true,
    isLogVisible: true,
    currentPane: 0,
    paneNames: [],
};

const isAboutPane = (pane: number, paneCount: number) => pane === paneCount - 1;

interface PaneSpec {
    name: string;
    Main: unknown;
}

const slice = createSlice({
    name: 'appLayout',
    initialState,
    reducers: {
        toggleLogVisible: state => {
            state.isLogVisible = !state.isLogVisible;
        },
        toggleSidePanelVisible: state => {
            state.isSidePanelVisible = !state.isSidePanelVisible;
        },
        setCurrentPane: (state, action) => {
            if (!isAboutPane(action.payload, state.paneNames.length)) {
                persistCurrentPane(action.payload);
            }
            state.currentPane = action.payload;
        },
        setPanes: (state, action: PayloadAction<PaneSpec[]>) => {
            state.paneNames = action.payload.map(pane => pane.name);
        },
    },
});

export const {
    reducer,
    actions: {
        setCurrentPane,
        setPanes,
        toggleLogVisible,
        toggleSidePanelVisible,
    },
} = slice;

export const isSidePanelVisible = (state: RootState) =>
    state.appLayout.isSidePanelVisible;
export const isLogVisible = (state: RootState) => state.appLayout.isLogVisible;
export const paneNames = (state: RootState) => state.appLayout.paneNames;

export const currentPane = ({ appLayout }: RootState) =>
    appLayout.currentPane >= appLayout.paneNames.length
        ? 0
        : appLayout.currentPane;
