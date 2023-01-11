/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Device, DeviceState, RootState } from '../state';
import {
    getPersistedIsFavorite,
    getPersistedNickname,
    persistIsFavorite,
    persistNickname,
} from '../utils/persistentStore';
import { displayedDeviceName } from './deviceInfo/deviceInfo';

const updateDevice = (
    state: DeviceState,
    serialNumber: string,
    updateToMergeIn: Partial<Device>
) => {
    const device = state.devices.get(serialNumber);
    if (device) {
        Object.assign(device, updateToMergeIn);
    }
};

const noDialogShown = {
    isSetupDialogVisible: false,
    setupDialogText: null,
    setupDialogChoices: [],
};

const initialState: DeviceState = {
    devices: new Map(),
    selectedSerialNumber: null,
    deviceInfo: null,
    isSetupWaitingForUserInput: false,
    autoReconnect: false,
    ...noDialogShown,
};

const slice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        /*
         * Indicates that a device has been selected.
         */
        selectDevice: (state, action: PayloadAction<Device>) => {
            state.selectedSerialNumber = action.payload.serialNumber;
            state.autoReconnectDevice = {
                device: { ...action.payload },
            };
        },

        /*
         * Indicates that the currently selected device has been deselected.
         */
        deselectDevice: state => {
            state.selectedSerialNumber = null;
            state.deviceInfo = null;
            state.autoReconnectDevice = null;
        },

        /*
         * Indicates that device setup is complete. This means that the device is
         * ready for use according to the `config.deviceSetup` configuration provided
         * by the app.
         */
        deviceSetupComplete: (state, action: PayloadAction<Device>) => ({
            ...state,
            ...noDialogShown,
            deviceInfo: action.payload,
        }),

        /*
         * Indicates that device setup failed.
         */
        deviceSetupError: state => ({
            ...state,
            ...noDialogShown,
        }),

        /*
         * Indicates that some part of the device setup operation requires input
         * from the user. When the user has provided the required input, then
         * DEVICE_SETUP_INPUT_RECEIVED is dispatched with the given input.
         */
        deviceSetupInputRequired: {
            reducer: (
                state,
                action: PayloadAction<{ message: string; choices: string[] }>
            ) => ({
                ...state,
                isSetupDialogVisible: true,
                isSetupWaitingForUserInput: true,
                setupDialogText: action.payload.message,
                setupDialogChoices:
                    action.payload.choices == null
                        ? []
                        : [...action.payload.choices],
            }),
            prepare: (message: string, choices: string[]) => ({
                payload: {
                    message,
                    choices,
                },
            }),
        },

        /*
         * Indicates that the user has provided input to the device setup operation.
         * This action is dispatched after DEVICE_SETUP_INPUT_REQUIRED.
         *
         */
        deviceSetupInputReceived: state => {
            state.isSetupWaitingForUserInput = false;
        },

        setDevices: (state, action: PayloadAction<Device[]>) => {
            state.devices.clear();
            action.payload.forEach(device => {
                state.devices.set(device.serialNumber, device);
            });
        },

        addDevice: (state, action: PayloadAction<Device>) => {
            state.devices.set(action.payload.serialNumber, {
                ...action.payload,
                favorite: getPersistedIsFavorite(action.payload.serialNumber),
                nickname: getPersistedNickname(action.payload.serialNumber),
            });
        },

        removeDevice: (state, action: PayloadAction<Device>) => {
            state.devices.delete(action.payload.serialNumber);

            if (
                state.autoReconnectDevice?.device.serialNumber ===
                action.payload.serialNumber
            ) {
                state.autoReconnectDevice.disconnectionTime = Date.now();
                state.selectedSerialNumber = null;
                state.deviceInfo = null;
            }
        },

        toggleDeviceFavorited: (state, action: PayloadAction<string>) => {
            const newFavoriteState = !state.devices.get(action.payload)
                ?.favorite;
            persistIsFavorite(action.payload, newFavoriteState);
            updateDevice(state, action.payload, {
                favorite: newFavoriteState,
            });
        },

        setDeviceNickname: {
            prepare: (serialNumber: string, nickname: string) => ({
                payload: { serialNumber, nickname },
            }),
            reducer: (
                state,
                action: PayloadAction<{
                    serialNumber: string;
                    nickname: string;
                }>
            ) => {
                persistNickname(
                    action.payload.serialNumber,
                    action.payload.nickname
                );
                updateDevice(state, action.payload.serialNumber, {
                    nickname: action.payload.nickname,
                });
            },
        },

        resetDeviceNickname: (state, action: PayloadAction<string>) => {
            persistNickname(action.payload, '');
            updateDevice(state, action.payload, {
                nickname: '',
            });
        },

        setGlobalAutoReconnect: (state, action: PayloadAction<boolean>) => {
            state.autoReconnect = action.payload;
        },
    },
});

export const {
    reducer,
    actions: {
        deselectDevice,
        deviceSetupComplete,
        deviceSetupError,
        deviceSetupInputReceived,
        deviceSetupInputRequired,
        resetDeviceNickname,
        selectDevice,
        addDevice,
        removeDevice,
        setDevices,
        setDeviceNickname,
        toggleDeviceFavorited,
        setGlobalAutoReconnect,
    },
} = slice;

const sorted = (devices: Device[]) =>
    [...devices].sort((a, b) => {
        if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
        }

        return displayedDeviceName(a) < displayedDeviceName(b) ? -1 : 1;
    });

export const getDevice = (serialNumber: string) => (state: RootState) =>
    state.device.devices.get(serialNumber);

export const sortedDevices = (state: RootState) =>
    sorted([...state.device.devices.values()]);

export const deviceIsSelected = (state: RootState) =>
    state.device.selectedSerialNumber != null;

export const getAutoReconnectDevice = (state: RootState) =>
    state.device.autoReconnect ? state.device.autoReconnectDevice : null;

export const selectedDevice = (state: RootState) =>
    state.device.selectedSerialNumber
        ? state.device.devices.get(state.device.selectedSerialNumber)
        : undefined;

export const deviceInfo = (state: RootState) => state.device.deviceInfo;
export const selectedSerialNumber = (state: RootState) =>
    state.device.selectedSerialNumber;

export const getGlobalAutoReconnect = (state: RootState) =>
    state.device.autoReconnect;
