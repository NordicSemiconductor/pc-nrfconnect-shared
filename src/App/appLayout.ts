/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import { AppLayout, AppLayoutPane, RootState } from '../state';
import { persistCurrentPane } from '../utils/persistentStore';

const initialState: AppLayout = {
    isSidePanelVisible: true,
    isLogVisible: true,
    currentPane: 0,
    panes: [],
};

const isAboutPane = (pane: number, allPanes: AppLayoutPane[]) =>
    pane === allPanes.length - 1;

const slice = createSlice({
    name: 'appLayout',
    initialState,
    reducers: {
        toggleLogVisible: (state, action) => {
            state.isLogVisible = action.payload;
        },
        toggleSidePanelVisible: (state, action) => {
            state.isSidePanelVisible = action.payload;
        },
        setCurrentPane: (state, action) => {
            if (!isAboutPane(action.payload, state.panes)) {
                persistCurrentPane(action.payload);
            }
            state.currentPane = action.payload;
        },
        setPanes: (state, action) => {
            state.panes = action.payload;
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
export const panes = (state: RootState) => state.appLayout.panes;

export const currentPane = ({ appLayout }: RootState) =>
    appLayout.currentPane >= appLayout.panes.length ? 0 : appLayout.currentPane;
