/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AnyAction,
    createSlice,
    nanoid,
    PayloadAction,
    ThunkAction,
} from '@reduxjs/toolkit';

import type { RootState } from '../store';

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
        addNewMessage: {
            reducer: (state, action: PayloadAction<FlashMessage>) => {
                state.messages.push(action.payload);
            },
            prepare: (message: FlashMessagePayload) => ({
                payload: {
                    id: nanoid(),
                    ...message,
                },
            }),
        },
        removeMessage: (state, action: PayloadAction<{ id: string }>) => {
            state.messages = state.messages.filter(
                message => message.id !== action.payload.id
            );
        },
    },
});

type TAction = ThunkAction<void, RootState, null, AnyAction>;

export const newCopiedFlashMessage = (): TAction => dispatch =>
    dispatch(newInfoFlashMessage('Copied to clipboard!', 12000));

export const newSuccessFlashMessage =
    (message: string, dismissTime?: number): TAction =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'success', dismissTime }));

export const newWarningFlashMessage =
    (message: string, dismissTime?: number): TAction =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'warning', dismissTime }));

export const newErrorFlashMessage =
    (message: string, dismissTime?: number): TAction =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'error', dismissTime }));

export const newInfoFlashMessage =
    (message: string, dismissTime?: number): TAction =>
    dispatch =>
        dispatch(newFlashMessage({ message, variant: 'info', dismissTime }));

const newFlashMessage =
    ({ message, variant, dismissTime }: FlashMessagePayload): TAction =>
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
