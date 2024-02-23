/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

import type { AppThunk, RootState } from '../store';

export interface ConfirmBeforeCloseApp {
    id: string;
    message: React.ReactNode;
    onClose?: () => void;
}

export interface ConfirmBeforeCloseState {
    confirmCloseApp: ConfirmBeforeCloseApp[];
    showCloseDialog: boolean;
}

const initialState: ConfirmBeforeCloseState = {
    confirmCloseApp: [],
    showCloseDialog: false,
};

const slice = createSlice({
    name: 'confirmBeforeCloseDialog',
    initialState,
    reducers: {
        addConfirmBeforeClose(
            state,
            action: PayloadAction<ConfirmBeforeCloseApp>
        ) {
            const index = state.confirmCloseApp.findIndex(
                confirmCloseApp => confirmCloseApp.id === action.payload.id
            );

            if (index !== -1) {
                state.confirmCloseApp[index] = action.payload;
            } else {
                state.confirmCloseApp = [
                    action.payload,
                    ...state.confirmCloseApp,
                ];
            }
        },
        clearConfirmBeforeClose(state, action: PayloadAction<string>) {
            state.confirmCloseApp = state.confirmCloseApp.filter(
                confirmCloseApp => confirmCloseApp.id !== action.payload
            );
        },
        setShowCloseDialog(state, action: PayloadAction<boolean>) {
            state.showCloseDialog = action.payload;
        },
    },
});

export const {
    reducer,
    actions: {
        addConfirmBeforeClose,
        setShowCloseDialog,
        clearConfirmBeforeClose,
    },
} = slice;

export const getNextConfirmDialog = (state: RootState) =>
    state.confirmBeforeCloseDialog.confirmCloseApp.length > 0
        ? state.confirmBeforeCloseDialog.confirmCloseApp[0]
        : undefined;

export const getShowConfirmCloseDialog = (state: RootState) =>
    state.confirmBeforeCloseDialog.showCloseDialog;

export const preventAppCloseUntilComplete =
    (
        dialogInfo: Omit<ConfirmBeforeCloseApp, 'id'>,
        promise: Promise<unknown>,
        abortController?: AbortController
    ): AppThunk =>
    dispatch => {
        const id = uuid();
        dispatch(
            addConfirmBeforeClose({
                ...dialogInfo,
                id,
                onClose: () => {
                    dialogInfo.onClose?.();
                    abortController?.abort();
                },
            })
        );
        promise.finally(() => dispatch(clearConfirmBeforeClose(id)));
    };
