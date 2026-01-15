/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '../store';

export interface DeviceSetupState {
    visible: boolean;
    onUserInput?: (canceled: boolean, choice?: number) => void;
    message: string;
    progressMessage?: string;
    choices?: string[];
    progress?: number;
}

const initialState: DeviceSetupState = {
    visible: false,
    message: '',
    choices: [],
    onUserInput: () => {},
};

// onUserInput: (canceled: boolean, choice: boolean | string) => void, choices: string[]

const slice = createSlice({
    name: 'deviceSetup',
    initialState,
    reducers: {
        openDeviceSetupDialog: (
            state,
            action: PayloadAction<{
                onUserInput?: (canceled: boolean, choice?: number) => void;
                message: string;
                choices?: string[];
            }>,
        ) => {
            state.visible = true;
            state.onUserInput = action.payload.onUserInput;
            state.choices = action.payload.choices;
            state.message = action.payload.message;
        },
        closeDeviceSetupDialog: () => ({ ...initialState }),

        setDeviceSetupProgress: (state, action: PayloadAction<number>) => {
            state.progress = action.payload;
        },
        setDeviceSetupMessage: (state, action: PayloadAction<string>) => {
            state.message = action.payload;
        },
        setDeviceSetupProgressMessage: (
            state,
            action: PayloadAction<string>,
        ) => {
            state.progressMessage = action.payload;
        },
        deviceSetupUserInputReceived: state => {
            state.onUserInput = undefined;
        },
    },
});

export const {
    reducer,
    actions: {
        openDeviceSetupDialog,
        closeDeviceSetupDialog,
        setDeviceSetupProgress,
        setDeviceSetupMessage,
        setDeviceSetupProgressMessage,
        deviceSetupUserInputReceived,
    },
} = slice;

export const isDeviceSetupDialogVisible = (state: RootState) =>
    state.deviceSetup.visible;

export const getDeviceSetupProgress = (state: RootState) =>
    state.deviceSetup.progress;

export const getDeviceSetupMessage = (state: RootState) =>
    state.deviceSetup.message;

export const getDeviceSetupProgressMessage = (state: RootState) =>
    state.deviceSetup.progressMessage;

export const getDeviceSetupChoices = (state: RootState) =>
    state.deviceSetup.choices;

export const getDeviceSetupUserInputCallback = (state: RootState) =>
    state.deviceSetup.onUserInput;
