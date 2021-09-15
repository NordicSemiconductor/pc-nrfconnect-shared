/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getPersistedCurrentPane,
    persistCurrentPane,
} from '../utils/persistentStore';

const TOGGLE_LOG_VISIBLE = 'TOGGLE_LOG_VISIBLE';
const TOGGLE_SIDE_PANEL_VISIBLE = 'TOGGLE_SIDE_PANEL_VISIBLE';
const SET_CURRENT_PANE = 'SET_CURRENT_PANE';
const SET_PANES = 'SET_PANES';

export const toggleLogVisible = () => ({ type: TOGGLE_LOG_VISIBLE });
export const toggleSidePanelVisible = () => ({
    type: TOGGLE_SIDE_PANEL_VISIBLE,
});
export const setCurrentPane = currentPane => ({
    type: SET_CURRENT_PANE,
    currentPane,
});
export const setPanes = panes => ({
    type: SET_PANES,
    panes,
});

/* This must be a function because of getPersistedCurrentPane:
  getPersistedCurrentPane can only be called when package.json was
  already read in packageJson.ts. So the initial state must not be
  determined as early as loading the module but only later when invoking
  the reducer with an undefined state */
const initialState = () => ({
    isSidePanelVisible: true,
    isLogVisible: true,
    currentPane: getPersistedCurrentPane() ?? 0,
    panes: [],
});

const isAboutPane = (pane, allPanes) => pane === allPanes.length - 1;

export const reducer = (
    state = initialState(),
    { type, currentPane, panes }
) => {
    switch (type) {
        case TOGGLE_SIDE_PANEL_VISIBLE:
            return { ...state, isSidePanelVisible: !state.isSidePanelVisible };
        case TOGGLE_LOG_VISIBLE:
            return { ...state, isLogVisible: !state.isLogVisible };
        case SET_CURRENT_PANE:
            if (!isAboutPane(currentPane, state.panes)) {
                persistCurrentPane(currentPane);
            }
            return { ...state, currentPane };
        case SET_PANES:
            return { ...state, panes };
        default:
            return state;
    }
};

export const isSidePanelVisible = state => state.appLayout.isSidePanelVisible;
export const isLogVisible = state => state.appLayout.isLogVisible;
export const panes = state => state.appLayout.panes;

export const currentPane = ({ appLayout }) =>
    appLayout.currentPane >= appLayout.panes.length ? 0 : appLayout.currentPane;
