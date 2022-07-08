/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { RootState } from '../state';

export interface Shortcut {
    hotKey: string[] | string;
    title: string;
    isGlobal: boolean;
    action: () => void;
}

export interface ShortcutState {
    shortcuts: Shortcut[];
}

const initialState = (): ShortcutState => ({
    shortcuts: [],
});

const slice = createSlice({
    name: 'shortcuts',
    initialState: initialState(),
    reducers: {
        addShortcut: (state, action: PayloadAction<Shortcut>) => {
            state.shortcuts.push(action.payload);
        },
        removeShortcut: (state, action: PayloadAction<Shortcut>) => {
            const shortcutToRemove = state.shortcuts.findIndex(
                shortcutElement =>
                    shortcutElement.title === action.payload.title
            );
            state.shortcuts.splice(shortcutToRemove, 1);
        },
    },
});

export const {
    reducer,
    actions: { addShortcut, removeShortcut },
} = slice;

export const shortcuts = (state: RootState) => state.shortcuts.shortcuts;
export const localShortcuts = (state: RootState) => {
    const local: Shortcut[] = state.shortcuts.shortcuts
        .filter(shortcut => !shortcut.isGlobal)
        .sort((s1, s2) => s1.title.localeCompare(s2.title));
    return local;
};
export const globalShortcuts = (state: RootState) => {
    const global: Shortcut[] = state.shortcuts.shortcuts
        .filter(shortcut => shortcut.isGlobal)
        .sort((s1, s2) => s1.title.localeCompare(s2.title));
    return global;
};
