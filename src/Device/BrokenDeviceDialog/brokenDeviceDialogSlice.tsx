/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../../store';

export interface BrokenDeviceDialog {
    isVisible: boolean;
    description: string;
    url: string;
}

const initialState: BrokenDeviceDialog = {
    isVisible: false,
    description: '',
    url: '',
};

const slice = createSlice({
    name: 'brokenDeviceDialog',
    initialState,
    reducers: {
        showDialog: (state, action) => {
            state.isVisible = true;
            state.description = action.payload.description;
            state.url = action.payload.url;
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

export const isVisible = (state: RootState) =>
    state.brokenDeviceDialog.isVisible;
export const info = (state: RootState) => ({
    description: state.brokenDeviceDialog.description,
    url: state.brokenDeviceDialog.url,
});
