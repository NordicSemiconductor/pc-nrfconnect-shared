/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import { ErrorDialog, ErrorResolutions, RootState } from '../state';

const appendIfNew = (messages: string[], message: string) =>
    messages.includes(message) ? messages : [...messages, message];

const initialState: ErrorDialog = {
    messages: [],
    isVisible: false,
    errorResolutions: undefined,
};

const slice = createSlice({
    name: 'errorDialog',
    initialState,
    reducers: {
        showDialogInternal: (state, action) => {
            state.isVisible = true;
            state.errorResolutions = action.payload.errorResolutions;
            state.messages = appendIfNew(
                state.messages,
                action.payload.message
            );
        },
        hideDialog: state => {
            state.isVisible = false;
        },
    },
});

export const showDialog = (
    message: string,
    errorResolutions: ErrorResolutions
) => slice.actions.showDialogInternal({ message, errorResolutions });

export const {
    reducer,
    actions: { hideDialog },
} = slice;

export const isVisible = (state: RootState) => state.errorDialog.isVisible;
export const messages = (state: RootState) => state.errorDialog.messages;
export const errorResolutions = (state: RootState) =>
    state.errorDialog.errorResolutions;
