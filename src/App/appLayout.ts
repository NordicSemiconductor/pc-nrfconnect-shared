/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';
import { persistCurrentPane } from '../utils/persistentStore';

export interface AppLayout {
    isSidePanelVisible: boolean;
    isLogVisible: boolean;
    currentPane: number;
    paneNames: string[];
}

const initialState: AppLayout = {
    isSidePanelVisible: true,
    isLogVisible: true,
    currentPane: 0,
    paneNames: [],
};

const isAboutPane = (pane: number, paneCount: number) => pane === paneCount - 1;

const setCurrentPaneInState = (newPane: number, state: AppLayout) => {
    if (!isAboutPane(newPane, state.paneNames.length)) {
        persistCurrentPane(newPane);
    }
    state.currentPane = newPane;
};

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
        setCurrentPane: (
            state,
            { payload: newPane }: PayloadAction<number>
        ) => {
            setCurrentPaneInState(newPane, state);
        },
        setPanes: (state, action: PayloadAction<PaneSpec[]>) => {
            state.paneNames = action.payload.map(pane => pane.name);
        },
        switchToNextPane: state => {
            setCurrentPaneInState(
                (state.currentPane + 1) % state.paneNames.length,
                state
            );
        },
        switchToPreviousPane: state => {
            let nextPane = state.currentPane - 1;
            if (nextPane < 0) {
                nextPane = state.paneNames.length - 1;
            }
            setCurrentPaneInState(nextPane, state);
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
        switchToNextPane,
        switchToPreviousPane,
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
