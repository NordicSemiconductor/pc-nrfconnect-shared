/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Device, DeviceInfo, Devices, DeviceState, RootState } from '../state';
import {
    getPersistedIsFavorite,
    getPersistedNickname,
    persistIsFavorite,
    persistNickname,
} from '../utils/persistentStore';
import { displayedDeviceName } from './deviceInfo/deviceInfo';

const withPersistedData = (devices: Device[]) =>
    devices.map((device: Device) => ({
        ...device,
        favorite: getPersistedIsFavorite(device.serialNumber),
        nickname: getPersistedNickname(device.serialNumber),
    }));

const bySerialNumber = (devices: Device[]) => {
    const devicesBySerialNumber: Devices = {};
    devices.forEach(device => {
        devicesBySerialNumber[device.serialNumber] = device;
    });

    return devicesBySerialNumber;
};

const updateDevice = (
    state: DeviceState,
    serialNumber: string,
    updateToMergeIn: Partial<Device>
) => {
    const device = state.devices[serialNumber];
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
    devices: {},
    selectedSerialNumber: null,
    deviceInfo: null,
    isSetupWaitingForUserInput: false,
    ...noDialogShown,
};

const slice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        /*
         * Indicates that a device has been selected.
         *
         * @param {Device} device Device object as given by nrf-device-lib.
         */
        selectDevice: (state, action: PayloadAction<Device>) => {
            state.selectedSerialNumber = action.payload.serialNumber;
        },

        /*
         * Indicates that the currently selected device has been deselected.
         */
        deselectDevice: state => {
            state.selectedSerialNumber = null;
            state.deviceInfo = null;
        },

        /*
         * Indicates that device setup is complete. This means that the device is
         * ready for use according to the `config.deviceSetup` configuration provided
         * by the app.
         *
         * @param {Object} device Device object as given by nrf-device-lib.
         */
        deviceSetupComplete: (state, action: PayloadAction<DeviceInfo>) => {
            return { ...state, ...noDialogShown, deviceInfo: action.payload };
        },

        // /**
        //  * Indicates that device setup failed.
        //  *
        //  * @param {Object} device Device object as given by nrf-device-lib.
        //  * @param {Object} error Error object describing the error.
        //  */
        deviceSetupError: state => {
            return {
                ...state,
                ...noDialogShown,
            };
        },

        // /**
        //  * Indicates that some part of the device setup operation requires input
        //  * from the user. When the user has provided the required input, then
        //  * DEVICE_SETUP_INPUT_RECEIVED is dispatched with the given input.
        //  *
        //  * @param {String} message The message to display to the user.
        //  * @param {Array<String>} [choices] Values that the user can choose from (optional).
        //  */
        deviceSetupInputRequired: {
            reducer: (
                state,
                action: PayloadAction<{ message: string; choices: string[] }>
            ) => {
                return {
                    ...state,
                    isSetupDialogVisible: true,
                    isSetupWaitingForUserInput: true,
                    setupDialogText: action.payload.message,
                    setupDialogChoices:
                        action.payload.choices == null
                            ? []
                            : [...action.payload.choices],
                };
            },
            prepare: (message: string, choices: string[]) => ({
                payload: {
                    message,
                    choices,
                },
            }),
        },

        // /**
        //  * Indicates that the user has provided input to the device setup operation.
        //  * This action is dispatched after DEVICE_SETUP_INPUT_REQUIRED.
        //  *
        //  */
        deviceSetupInputReceived: state => {
            state.isSetupWaitingForUserInput = false;
        },

        // /**
        //  * Indicates that devices have been detected. This is triggered by default at
        //  * startup, and whenever a device is attached/detached. The app can configure
        //  * which devices to look for by providing a `config.selectorTraits` property.
        //  *
        //  * @param {Array} devices Array of all attached devices, ref. nrf-device-lib.
        //  */
        devicesDetected: (state, action: PayloadAction<Device[]>) => {
            state.devices = bySerialNumber(withPersistedData(action.payload));
        },

        toggleDeviceFavorited: (state, action: PayloadAction<string>) => {
            const newFavoriteState = !state.devices[action.payload]?.favorite;
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
        devicesDetected,
        resetDeviceNickname,
        selectDevice,
        setDeviceNickname,
        toggleDeviceFavorited,
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
    state.device?.devices[serialNumber];

export const sortedDevices = (state: RootState) =>
    sorted(Object.values(<Device[]>(<unknown>state.device.devices)));

export const deviceIsSelected = (state: RootState) =>
    state.device?.selectedSerialNumber != null;

export const selectedDevice = (state: RootState) =>
    state.device.devices[state.device.selectedSerialNumber ?? ''];

export const deviceInfo = (state: RootState) => state.device.deviceInfo;
export const selectedSerialNumber = (state: RootState) =>
    state.device.selectedSerialNumber;
