/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
    Device,
    DeviceAutoSelectState,
    ForceAutoReselect,
    RootState,
} from '../state';

const initialState: DeviceAutoSelectState = {
    globalAutoReselect: false,
};

const slice = createSlice({
    name: 'deviceAutoSelect',
    initialState,
    reducers: {
        setAutoReconnectTimeoutID: (
            state,
            action: PayloadAction<NodeJS.Timeout>
        ) => {
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = action.payload;
        },

        clearAutoReconnectTimeoutID: state => {
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = undefined;
        },

        setAutoSelectDevice: (
            state,
            action: PayloadAction<Device | undefined>
        ) => {
            state.device = action.payload ? { ...action.payload } : undefined;
            state.disconnectionTime = undefined;
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = undefined;

            if (state.forceReselect?.once) {
                state.forceReselect = undefined;
            }
        },

        setDisconnectedTime: (
            state,
            action: PayloadAction<number | undefined>
        ) => {
            if (state.device) {
                state.disconnectionTime = action.payload;
            }
        },

        setGlobalAutoReselect: (state, action: PayloadAction<boolean>) => {
            state.globalAutoReselect = action.payload;
            if (state.disconnectionTime !== undefined) {
                state.device = undefined;
            }
        },

        setForceAutoReselect: (
            state,
            action: PayloadAction<ForceAutoReselect>
        ) => {
            if (state.device) state.forceReselect = action.payload;
        },

        clearAutoReselect: state => {
            state.device = undefined;
            state.forceReselect = undefined;
            state.disconnectionTime = undefined;
            clearTimeout(state.autoReconnectTimeout);
            state.autoReconnectTimeout = undefined;
        },
    },
});

export const {
    reducer,
    actions: {
        setAutoReconnectTimeoutID,
        clearAutoReconnectTimeoutID,
        setAutoSelectDevice,
        setDisconnectedTime,
        setGlobalAutoReselect,
        setForceAutoReselect,
        clearAutoReselect,
    },
} = slice;

export const getAutoReselectDevice = (state: RootState) =>
    state.deviceAutoSelect.device;

export const getGlobalAutoReselect = (state: RootState) =>
    state.deviceAutoSelect.globalAutoReselect;

export const getWaitingToAutoReselect = (state: RootState) =>
    state.deviceAutoSelect.disconnectionTime !== undefined &&
    (state.deviceAutoSelect.forceReselect !== undefined ||
        state.deviceAutoSelect.globalAutoReselect);

export const getDisconnectionTime = (state: RootState) =>
    state.deviceAutoSelect.disconnectionTime;

export const getForceReselect = (state: RootState) =>
    state.deviceAutoSelect.forceReselect;
