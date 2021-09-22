/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import { AppLayout, AppLayoutPane, RootState } from '../state';
import {
    getPersistedCurrentPane,
    persistCurrentPane,
} from '../utils/persistentStore';

/* This must be a function because of getPersistedCurrentPane:
  getPersistedCurrentPane can only be called when package.json was
  already read in packageJson.ts. So the initial state must not be
  determined as early as loading the module but only later when invoking
  the reducer with an undefined state */
const initialState = (): AppLayout => ({
    isSidePanelVisible: true,
    isLogVisible: true,
    currentPane: getPersistedCurrentPane() ?? 0,
    panes: [],
});

const isAboutPane = (pane: number, allPanes: AppLayoutPane[]) =>
    pane === allPanes.length - 1;

const slice = createSlice({
    name: 'appLayout',
    initialState: initialState(),
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
