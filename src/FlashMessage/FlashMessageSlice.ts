/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

import type { AppThunk, RootState } from '../store';

export interface FlashMessages {
    messages: FlashMessage[];
}

export type FlashMessageVariant = 'success' | 'warning' | 'error' | 'info';

export interface FlashMessage {
    id: string;
    message: string;
    variant: FlashMessageVariant;
    dismissTime?: number;
}

export type FlashMessagePayload = Omit<FlashMessage, 'id'>;

const initialState: FlashMessages = {
    messages: [],
};

const slice = createSlice({
    name: 'flashMessages',
    initialState,
    reducers: {
        addNewMessage: (
            state,
            { payload: message }: PayloadAction<FlashMessagePayload>
        ) => {
            state.messages.push({ ...message, id: nanoid() });
        },
        removeMessage: (state, { payload: id }: PayloadAction<string>) => {
            state.messages = state.messages.filter(
                message => message.id !== id
            );
        },
    },
});

export const newCopiedFlashMessage = (): AppThunk => dispatch =>
    dispatch(newInfoFlashMessage('Copied to clipboard!', 3000));

export const newSuccessFlashMessage =
    (message: string, dismissTime?: number): AppThunk =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'success', dismissTime }));

export const newWarningFlashMessage =
    (message: string, dismissTime?: number): AppThunk =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'warning', dismissTime }));

export const newErrorFlashMessage =
    (message: string, dismissTime?: number): AppThunk =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'error', dismissTime }));

export const newInfoFlashMessage =
    (message: string, dismissTime?: number): AppThunk =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'info', dismissTime }));

const newFlashMessage =
    ({ message, variant, dismissTime }: FlashMessagePayload): AppThunk =>
    dispatch => {
        dispatch(
            addNewMessage({
                message,
                variant,
                dismissTime,
            })
        );
    };

export const getMessages = (state: RootState) => state.flashMessages.messages;

export const {
    reducer,
    actions: { addNewMessage, removeMessage },
} = slice;
