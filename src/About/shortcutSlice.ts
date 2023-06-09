/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
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

export const {
    reducer,
    actions: { addShortcut, removeShortcut },
} = slice;

const sortedShortcuts = (shortcuts: Iterable<Shortcut>, global: boolean) =>
    Array.from(shortcuts)
        .filter(shortcut => shortcut.isGlobal === global)
        .sort((s1, s2) => s1.title.localeCompare(s2.title));

export const globalShortcuts = (state: RootState) =>
    sortedShortcuts(state.shortcuts, true);

export const localShortcuts = (state: RootState) =>
    sortedShortcuts(state.shortcuts, false);
