/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';

const appendIfNew = (messages: ErrorMessage[], message: ErrorMessage) => {
    const messageExists = messages.some(
        existingMessage =>
            existingMessage.message === message.message &&
            existingMessage.detail === message.detail
    );

    return messageExists ? messages : [...messages, message];
};

export interface ErrorResolutions {
    [key: string]: () => void;
}

export interface ErrorMessage {
    message: string;
    detail?: string;
}

export interface ErrorDialog {
    isVisible: boolean;
    messages: ErrorMessage[];
    errorResolutions?: ErrorResolutions;
}

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
                errorResolutions?: ErrorResolutions,
                detail?: string
            ) => ({
                payload: { message: { message, detail }, errorResolutions },
            }),
            reducer: (
                state,
                {
                    payload: error,
                }: PayloadAction<{
                    message: ErrorMessage;
                    errorResolutions?: ErrorResolutions;
                }>
            ) => {
                state.isVisible = true;
                state.errorResolutions = error.errorResolutions;
                state.messages = appendIfNew(state.messages, error.message);
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
