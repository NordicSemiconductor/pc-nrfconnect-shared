/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    createSelector,
    createSlice,
    type PayloadAction,
} from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';

import type { RootState } from '../store';

enableMapSet();

export interface Shortcut {
    hotKey: string[] | string;
    title: string;
    isGlobal: boolean;
    action: () => void;
}

export type ShortcutState = Set<Shortcut>;

const initialState: ShortcutState = new Set();

const slice = createSlice({
    name: 'shortcuts',
    initialState,
    reducers: {
        addShortcut: (state, action: PayloadAction<Shortcut>) => {
            state.add(action.payload);
        },
        removeShortcut: (state, action: PayloadAction<Shortcut>) => {
            state.delete(action.payload);
        },
    },
});

export const shortcutsSelector = (state: RootState) => state.shortcuts;

const sortedShortcuts = (shortcuts: Iterable<Shortcut>, global: boolean) =>
    Array.from(shortcuts)
        .filter(shortcut => shortcut.isGlobal === global)
        .sort((s1, s2) => s1.title.localeCompare(s2.title));

export const localShortcuts = createSelector([shortcutsSelector], shortcuts =>
    sortedShortcuts(shortcuts, false),
);

export const globalShortcuts = createSelector([shortcutsSelector], shortcuts =>
    sortedShortcuts(shortcuts, true),
);

export const {
    reducer,
    actions: { addShortcut, removeShortcut },
} = slice;
