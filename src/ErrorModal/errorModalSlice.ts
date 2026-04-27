/*
 * Copyright (c) 2026 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';

const appendIfNew = (messages: ErrorMessage[], message: ErrorMessage) => {
    const messageExists = messages.some(
        existingMessage =>
            existingMessage.message === message.message &&
            existingMessage.detail === message.detail,
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

export interface ErrorModal {
    isVisible: boolean;
    messages: ErrorMessage[];
    errorResolutions?: ErrorResolutions;
}

const initialState: ErrorModal = {
    messages: [],
    isVisible: false,
    errorResolutions: undefined,
};

const slice = createSlice({
    name: 'errorModal',
    initialState,
    reducers: {
        showModal: {
            prepare: (
                message: string,
                errorResolutions?: ErrorResolutions,
                detail?: string,
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
                }>,
            ) => {
                state.isVisible = true;
                state.errorResolutions = error.errorResolutions;
                state.messages = appendIfNew(state.messages, error.message);
            },
        },
        hideModal: () => initialState,
    },
});

export const {
    reducer,
    actions: { hideModal, showModal },
} = slice;

export const isVisible = (state: RootState) => state.errorModal.isVisible;
export const messages = (state: RootState) => state.errorModal.messages;
export const errorResolutions = (state: RootState) =>
    state.errorModal.errorResolutions;
