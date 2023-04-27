/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import { Device, DeviceState, RootState } from '../state';
import {
    getPersistedIsFavorite,
    getPersistedNickname,
    getPersistedSerialPortSettings,
    persistIsFavorite,
    persistNickname,
    persistSerialPortSettings as persistSerialPortSettingsToStore,
} from '../utils/persistentStore';

const updateDevice = (
    state: DeviceState,
    key: string,
    updateToMergeIn: Partial<Device>
) => {
    const device = state.devices.get(key);
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
    selectedKey: null,
    deviceInfo: null,
    isSetupWaitingForUserInput: false,
    readbackProtection: 'unknown',
    ...noDialogShown,
};

export const deviceKey = (device: Device) =>
    device.serialNumber ?? `${device.id}`;

const setPersistedData = (device: Device) => {
    const newDevice = {
        ...device,
        favorite: getPersistedIsFavorite(deviceKey(device)),
        nickname: getPersistedNickname(deviceKey(device)),
    };

    const persistedSerialPortSettings = getPersistedSerialPortSettings(
        deviceKey(newDevice)
    );

    if (persistedSerialPortSettings) {
        const path =
            newDevice.serialPorts?.[persistedSerialPortSettings.vComIndex]
                ?.comName;

        if (path) {
            newDevice.persistedSerialPortOptions = {
                ...persistedSerialPortSettings.serialPortOptions,
                path,
            };
        }
    }

    return newDevice;
};

const slice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        /*
         * Indicates that a device has been selected.
         */
        selectDevice: (state, action: PayloadAction<Device>) => {
            state.selectedKey = deviceKey(action.payload);
        },

        /*
         * Indicates that the currently selected device has been deselected.
         */
        deselectDevice: state => {
            state.selectedKey = null;
            state.deviceInfo = null;
            state.readbackProtection = 'unknown';
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
                state.devices.set(deviceKey(device), setPersistedData(device));
            });
        },

        addDevice: (state, action: PayloadAction<Device>) => {
            state.devices.set(
                deviceKey(action.payload),
                setPersistedData(action.payload)
            );
        },

        persistSerialPortOptions: (
            state,
            action: PayloadAction<SerialPortOpenOptions<AutoDetectTypes>>
        ) => {
            if (state.selectedKey === null) return;

            const selectedDevice = state.devices.get(state.selectedKey);

            if (selectedDevice) {
                const vComIndex = selectedDevice.serialPorts?.findIndex(
                    e => e.comName === action.payload.path
                );

                if (vComIndex !== undefined && vComIndex !== -1) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used to filter out the path property
                    const { path: _, ...serialPortOptions } = action.payload;

                    persistSerialPortSettingsToStore(state.selectedKey, {
                        serialPortOptions,
                        vComIndex,
                    });

                    state.devices.set(state.selectedKey, {
                        ...selectedDevice,
                        persistedSerialPortOptions: action.payload,
                    });
                }
            }
        },

        removeDevice: (state, action: PayloadAction<Device>) => {
            state.devices.delete(deviceKey(action.payload));

            if (state.selectedKey === deviceKey(action.payload)) {
                state.selectedKey = null;
                state.deviceInfo = null;
            }
        },

        toggleDeviceFavorited: (state, action: PayloadAction<Device>) => {
            const key = deviceKey(action.payload);
            const newFavoriteState = !state.devices.get(key)?.favorite;
            persistIsFavorite(key, newFavoriteState);
            updateDevice(state, key, {
                favorite: newFavoriteState,
            });
        },

        setDeviceNickname: {
            prepare: (device: Device, nickname: string) => ({
                payload: { key: deviceKey(device), nickname },
            }),
            reducer: (
                state,
                action: PayloadAction<{
                    key: string;
                    nickname: string;
                }>
            ) => {
                persistNickname(action.payload.key, action.payload.nickname);
                updateDevice(state, action.payload.key, {
                    nickname: action.payload.nickname,
                });
            },
        },

        resetDeviceNickname: (state, action: PayloadAction<Device>) => {
            persistNickname(deviceKey(action.payload), '');
            updateDevice(state, deviceKey(action.payload), {
                nickname: '',
            });
        },

        closeSetupDialogVisible: state => {
            state.isSetupDialogVisible = false;
        },

        setReadbackProtected: (
            state,
            action: PayloadAction<DeviceState['readbackProtection']>
        ) => {
            state.readbackProtection = action.payload;
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
        closeSetupDialogVisible,
        setReadbackProtected,
        persistSerialPortOptions,
    },
} = slice;

export const getDevice = (key: string) => (state: RootState) =>
    state.device.devices.get(key);

export const getDevices = (state: RootState) => state.device.devices;

export const deviceIsSelected = (state: RootState) =>
    state.device.selectedKey != null;

export const selectedDevice = (state: RootState) =>
    state.device.selectedKey !== null
        ? state.device.devices.get(state.device.selectedKey)
        : undefined;

export const deviceInfo = (state: RootState) => state.device.deviceInfo;
export const selectedKey = (state: RootState) => state.device.selectedKey;

export const getReadbackProtection = (state: RootState) =>
    state.device.readbackProtection;
