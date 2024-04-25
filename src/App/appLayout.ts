/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';
import {
    getPersistedLogVisible,
    persistCurrentPane,
    persistLogVisible,
} from '../utils/persistentStore';

interface Pane {
    name: string;
    hidden: boolean;
    disabled: boolean;
}

export interface AppLayout {
    isSidePanelVisible: boolean;
    isLogVisible: boolean;
    currentPane?: string;
    panes: Pane[];
}

const initialState: AppLayout = {
    isSidePanelVisible: true,
    isLogVisible: !!getPersistedLogVisible(),
    currentPane: undefined,
    panes: [],
};

const isAboutPane = (pane: string, panes: Pane[]) =>
    pane === panes[panes.length - 1].name;

const setCurrentPaneInState = (newPane: string, state: AppLayout) => {
    if (!isAboutPane(newPane, state.panes)) {
        persistCurrentPane(newPane);
    }
    state.currentPane = newPane;
};

const getValidPanes = (panes: Pane[]) =>
    panes.filter(p => !p.disabled && !p.hidden);

interface PaneSpec {
    name: string;
    preHidden?: boolean;
    preDisabled?: boolean;
}

const slice = createSlice({
    name: 'appLayout',
    initialState,
    reducers: {
        setLogVisible: (state, action: PayloadAction<boolean>) => {
            state.isLogVisible = action.payload;
            persistLogVisible(action.payload);
        },
        toggleSidePanelVisible: state => {
            state.isSidePanelVisible = !state.isSidePanelVisible;
        },
        setCurrentPane: (state, action: PayloadAction<string>) => {
            setCurrentPaneInState(action.payload, state);
        },
        setPanes: (state, action: PayloadAction<PaneSpec[]>) => {
            state.panes = action.payload.map(pane => ({
                name: pane.name,
                hidden: !!pane.preHidden,
                disabled: !!pane.preDisabled,
            }));

            if (
                !state.currentPane ||
                !state.panes.find(p => p.name === state.currentPane)
            ) {
                setCurrentPaneInState(
                    getValidPanes(state.panes)[0].name,
                    state
                );
            }
        },
        switchToNextPane: state => {
            const validPanes = getValidPanes(state.panes);
            const currentPaneIndex = state.panes.findIndex(
                pane => pane.name === state.currentPane
            );
            setCurrentPaneInState(
                validPanes[(currentPaneIndex + 1) % validPanes.length].name,
                state
            );
        },
        switchToPreviousPane: state => {
            const currentPaneIndex = state.panes.findIndex(
                pane => pane.name === state.currentPane
            );
            setCurrentPaneInState(
                getValidPanes(state.panes)[Math.max(0, currentPaneIndex - 1)]
                    .name,
                state
            );
        },
        setPaneHidden: (
            state,
            action: PayloadAction<{ name: string; hidden: boolean }>
        ) => {
            state.panes = state.panes.map(pane =>
                pane.name === action.payload.name
                    ? { ...pane, hidden: action.payload.hidden }
                    : pane
            );

            if (
                state.currentPane === action.payload.name &&
                action.payload.hidden
            ) {
                setCurrentPaneInState(
                    getValidPanes(state.panes)[0].name,
                    state
                );
            }
        },
        setPaneDisabled: (
            state,
            action: PayloadAction<{ name: string; disabled: boolean }>
        ) => {
            state.panes = state.panes.map(pane =>
                pane.name === action.payload.name
                    ? { ...pane, disabled: action.payload.disabled }
                    : pane
            );

            if (
                state.currentPane === action.payload.name &&
                action.payload.disabled
            ) {
                setCurrentPaneInState(
                    getValidPanes(state.panes)[0].name,
                    state
                );
            }
        },
    },
});

export const {
    reducer,
    actions: {
        setCurrentPane,
        setPanes,
        setLogVisible,
        toggleSidePanelVisible,
        switchToNextPane,
        switchToPreviousPane,
        setPaneHidden,
        setPaneDisabled,
    },
} = slice;

export const isSidePanelVisible = (state: RootState) =>
    state.appLayout.isSidePanelVisible;
export const isLogVisible = (state: RootState) => state.appLayout.isLogVisible;
export const panes = (state: RootState) =>
    state.appLayout.panes.filter(p => !p.hidden);

export const currentPane = ({ appLayout }: RootState) => appLayout.currentPane;
