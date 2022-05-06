/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
        showDialog: {
            prepare: (
                message: string,
                errorResolutions?: ErrorResolutions
            ) => ({
                payload: { message, errorResolutions },
            }),
            reducer: (
                state,
                action: PayloadAction<{
                    message: string;
                    errorResolutions?: ErrorResolutions;
                }>
            ) => {
                state.isVisible = true;
                state.errorResolutions = action.payload.errorResolutions;
                state.messages = appendIfNew(
                    state.messages,
                    action.payload.message
                );
            },
        },
        hideDialog: () => initialState,
    },
});

export const {
    reducer,
    actions: { hideDialog, showDialog },
} = slice;

export const isVisible = (state: RootState) => state.errorDialog.isVisible;
export const messages = (state: RootState) => state.errorDialog.messages;
export const errorResolutions = (state: RootState) =>
    state.errorDialog.errorResolutions;
