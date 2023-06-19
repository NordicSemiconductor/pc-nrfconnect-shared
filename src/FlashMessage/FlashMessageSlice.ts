/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    AnyAction,
    createSlice,
    PayloadAction,
    ThunkAction,
} from '@reduxjs/toolkit';

import logger from '../logging';
import { RootState } from '../store';

const MAX_NUMBER_OF_MESSAGES = 8;

interface State {
    idCounter: number;
    messages: FlashMessage[];
}

export type FlashMessageVariant = 'success' | 'warning' | 'error' | 'info';

export interface FlashMessage {
    id: number;
    message: string;
    variant: FlashMessageVariant;
    dismissTime?: number;
}

export type FlashMessagePayload = Omit<FlashMessage, 'id'>;

const initialState: State = {
    idCounter: 0,
    messages: [],
};

const slice = createSlice({
    name: 'app-messages',
    initialState,
    reducers: {
        addNewMessage: (state, action: PayloadAction<FlashMessagePayload>) => {
            if (state.messages.length >= MAX_NUMBER_OF_MESSAGES) {
                // Only remove the first message with a set time.
                const messageToRemove = state.messages.find(
                    msg => msg.dismissTime != null
                )?.id;
                if (messageToRemove) {
                    state.messages = state.messages.filter(
                        msg => msg.id !== messageToRemove
                    );
                } else {
                    logger.debug('Max number of flash messages reached');
                }
            }

            state.messages.push({ ...action.payload, id: state.idCounter });
            state.idCounter += 1;
        },
        removeMessage: (state, action: PayloadAction<number>) => {
            state.messages = state.messages.filter(
                message => message.id !== action.payload
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

export const getMessages = (state: RootState) =>
    state.app?.messages.messages as FlashMessage[];
export const { addNewMessage, removeMessage } = slice.actions;

export const flashMessageReducer = slice.reducer;
