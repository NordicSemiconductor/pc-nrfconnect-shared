/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    createSlice,
    createSelector,
    type PayloadAction,
} from '@reduxjs/toolkit';

import type { RootState } from '../store';

export interface ErrorContents {
    message: string;
    details?: string;
}

export interface ErrorResolution {
    description?: string;
    apply: () => void;
}

export interface AppError {
    contents: ErrorContents;
    resolutions: Map<string, ErrorResolution>;
}

export interface ErrorModalState {
    isVisible: boolean;
    errors: Map<string, AppError>;
}

const initialState: ErrorModalState = {
    isVisible: false,
    errors: new Map(),
};

const slice = createSlice({
    name: 'errorModal',
    initialState,
    reducers: {
        setError: {
            prepare({
                id,
                message,
                details,
                errorResolutions,
            }: {
                id: string;
                message: string;
                details?: string;
                errorResolutions?: Map<string, ErrorResolution>;
            }) {
                return {
                    payload: {
                        id,
                        error: {
                            contents: { message, details },
                            resolutions: errorResolutions,
                        },
                    },
                };
            },

            reducer(
                state: ErrorModalState,
                {
                    payload: { id, error },
                }: PayloadAction<{
                    id: string;
                    error: AppError;
                }>,
            ) {
                state.isVisible = true;
                state.errors.set(id, error);
            },
        },

        clearErrors() {
            return initialState;
        },
    },
});

export const {
    reducer,
    actions: { closeModal: hideDialog, showModal: showDialog },
} = slice;

export const isVisible = (state: RootState) => state.errorModal.isVisible;
export const errorsSelector = (state: RootState) => state.errorModal.errors;

export const messagesSelector = createSelector(
    [errorsSelector],
    (errors: Map<string, AppError>) =>
        new Map(
            Array.from(errors.entries()).map(([key, error]) => [
                key,
                error.contents.message,
            ]),
        ),
);
export const errorResolutionsSelector = createSelector(
    [errorsSelector],
    (errors: Map<string, AppError>) =>
        new Map(
            Array.from(errors.entries()).map(([key, error]) => [
                key,
                error.resolutions,
            ]),
        ),
);
export const flatErrorResolutionsSelector = createSelector(
    [errorsSelector],
    (errors: Map<string, AppError>) =>
        new Map(
            Array.from(errors.entries()).flatMap(([errId, err]) =>
                Array.from(err.resolutions.entries()).map(
                    ([errResolutionId, errResolution]) => [
                        `${errId}.${errResolutionId}`,
                        errResolution,
                    ],
                ),
            ),
        ),
);
