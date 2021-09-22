/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import { AppReloadDialog, RootState } from '../state';

const initialState: AppReloadDialog = {
    isVisible: false,
    message: '',
};

const slice = createSlice({
    name: 'appReloadDialog',
    initialState,
    reducers: {
        showDialog: (state, action) => {
            state.isVisible = true;
            state.message = action.payload;
        },
        hideDialog: state => {
            state.isVisible = false;
        },
    },
});

export const {
    reducer,
    actions: { hideDialog, showDialog },
} = slice;

export const isVisible = (state: RootState) => state.appReloadDialog.isVisible;
export const message = (state: RootState) => state.appReloadDialog.message;
