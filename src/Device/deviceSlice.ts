/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';

import { DeviceInfo } from '../../nrfutil';
import { NrfutilDevice, SerialPort } from '../../nrfutil/device/common';
import type { RootState } from '../store';
import {
    getPersistedIsFavorite,
    getPersistedNickname,
    getPersistedSerialPortSettings,
    persistIsFavorite,
    persistNickname,
    persistSerialPortSettings as persistSerialPortSettingsToStore,
} from '../utils/persistentStore';

export interface Device extends NrfutilDevice {
    serialNumber: string;
    nickname?: string;
    serialport?: SerialPort;
    favorite?: boolean;
    id: number;
    persistedSerialPortOptions?: SerialPortOpenOptions<AutoDetectTypes>;
}

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

export interface DeviceState {
    devices: Map<string, Device>;
    readbackProtection: 'unknown' | 'protected' | 'unprotected';
    selectedDevice?: Device;
    selectedDeviceInfo?: DeviceInfo;
}

const initialState: DeviceState = {
    devices: new Map(),
    readbackProtection: 'unknown',
};

const setPersistedData = (device: Device) => {
    const newDevice = {
        ...device,
        favorite: getPersistedIsFavorite(device.serialNumber),
        nickname: getPersistedNickname(device.serialNumber),
    };

    const persistedSerialPortSettings = getPersistedSerialPortSettings(
        newDevice.serialNumber
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
            state.selectedDevice = action.payload;
        },

        setSelectedDeviceInfo: (
            state,
            action: PayloadAction<DeviceInfo | undefined>
        ) => {
            state.selectedDeviceInfo = action.payload;
        },

        /*
         * Indicates that the currently selected device has been deselected.
         */
        deselectDevice: state => {
            state.selectedDevice = undefined;
            state.selectedDeviceInfo = undefined;
            state.readbackProtection = 'unknown';
        },

        addDevice: (state, action: PayloadAction<Device>) => {
            state.devices.set(
                action.payload.serialNumber,
                setPersistedData(action.payload)
            );
        },

        persistSerialPortOptions: (
            state,
            action: PayloadAction<SerialPortOpenOptions<AutoDetectTypes>>
        ) => {
            if (!state.selectedDevice) return;

            const selectedDevice = state.selectedDevice;

            if (selectedDevice) {
                const vComIndex = selectedDevice.serialPorts?.findIndex(
                    e => e.comName === action.payload.path
                );

                if (vComIndex !== undefined && vComIndex !== -1) {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- used to filter out the path property
                    const { path: _, ...serialPortOptions } = action.payload;

                    persistSerialPortSettingsToStore(
                        selectedDevice.serialNumber,
                        {
                            serialPortOptions,
                            vComIndex,
                        }
                    );

                    state.devices.set(selectedDevice.serialNumber, {
                        ...selectedDevice,
                        persistedSerialPortOptions: action.payload,
                    });
                }
            }
        },

        removeDevice: (state, action: PayloadAction<Device>) => {
            state.devices.delete(action.payload.serialNumber);

            if (
                action.payload.serialNumber ===
                state.selectedDevice?.serialNumber
            ) {
                state.selectedDevice = undefined;
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
        resetDeviceNickname,
        selectDevice,
        setSelectedDeviceInfo,
        addDevice,
        removeDevice,
        setDeviceNickname,
        toggleDeviceFavorited,
        setReadbackProtected,
        persistSerialPortOptions,
    },
} = slice;

export const getDevice = (serialNumber: string) => (state: RootState) =>
    state.device.devices.get(serialNumber);

export const getDevices = (state: RootState) => state.device.devices;

export const deviceIsSelected = (state: RootState) =>
    !!state.device.selectedDevice;

export const selectedDevice = (state: RootState) => state.device.selectedDevice;

export const selectedDeviceInfo = (state: RootState) =>
    state.device.selectedDevice ? state.device.selectedDeviceInfo : undefined;

export const selectedSerialNumber = (state: RootState) =>
    state.device.selectedDevice?.serialNumber;

export const getReadbackProtection = (state: RootState) =>
    state.device.readbackProtection;
