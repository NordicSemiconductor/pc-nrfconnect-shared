/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getPersistedIsFavorite,
    getPersistedNickname,
    persistIsFavorite,
    persistNickname,
} from '../utils/persistentStore';
import {
    DEVICE_DESELECTED,
    DEVICE_FAVORITE_TOGGLED,
    DEVICE_NICKNAME_RESET,
    DEVICE_NICKNAME_SET,
    DEVICE_SELECTED,
    DEVICE_SETUP_COMPLETE,
    DEVICE_SETUP_ERROR,
    DEVICE_SETUP_INPUT_RECEIVED,
    DEVICE_SETUP_INPUT_REQUIRED,
    DEVICES_DETECTED,
} from './deviceActions';
import { displayedDeviceName } from './deviceInfo/deviceInfo';

const withPersistedData = devices =>
    devices.map(device => ({
        ...device,
        favorite: getPersistedIsFavorite(device.serialNumber),
        nickname: getPersistedNickname(device.serialNumber),
    }));

const bySerialNumber = devices => {
    const devicesBySerialNumber = {};
    devices.forEach(device => {
        devicesBySerialNumber[device.serialNumber] = device;
    });

    return devicesBySerialNumber;
};

const withUpdatedDevice = (state, serialNumber, updateToMergeIn) => ({
    ...state,
    devices: {
        ...state.devices,
        [serialNumber]: {
            ...state.devices[serialNumber],
            ...updateToMergeIn,
        },
    },
});

const noDialogShown = {
    isSetupDialogVisible: false,
    setupDialogText: null,
    setupDialogChoices: [],
};

const initialState = {
    devices: {},
    selectedSerialNumber: null,
    deviceInfo: null,
    isSetupWaitingForUserInput: false,
    ...noDialogShown,
};

export default (state = initialState, action) => {
    switch (action.type) {
        case DEVICES_DETECTED: {
            return {
                ...state,
                devices: bySerialNumber(withPersistedData(action.devices)),
            };
        }
        case DEVICE_SELECTED:
            return {
                ...state,
                selectedSerialNumber: action.device.serialNumber,
            };
        case DEVICE_DESELECTED:
            return { ...state, selectedSerialNumber: null, deviceInfo: null };
        case DEVICE_SETUP_COMPLETE:
            return {
                ...state,
                ...noDialogShown,
                deviceInfo: action.device,
            };
        case DEVICE_SETUP_ERROR:
            return {
                ...state,
                ...noDialogShown,
            };
        case DEVICE_SETUP_INPUT_REQUIRED:
            return {
                ...state,
                isSetupDialogVisible: true,
                isSetupWaitingForUserInput: true,
                setupDialogText: action.message,
                setupDialogChoices:
                    action.choices == null ? [] : [...action.choices],
            };
        case DEVICE_SETUP_INPUT_RECEIVED:
            return { ...state, isSetupWaitingForUserInput: false };
        case DEVICE_FAVORITE_TOGGLED: {
            const newFavoriteState =
                !state.devices[action.serialNumber].favorite;

            persistIsFavorite(action.serialNumber, newFavoriteState);
            return withUpdatedDevice(state, action.serialNumber, {
                favorite: newFavoriteState,
            });
        }
        case DEVICE_NICKNAME_SET: {
            persistNickname(action.serialNumber, action.nickname);
            return withUpdatedDevice(state, action.serialNumber, {
                nickname: action.nickname,
            });
        }
        case DEVICE_NICKNAME_RESET: {
            persistNickname(action.serialNumber, '');
            return withUpdatedDevice(state, action.serialNumber, {
                nickname: '',
            });
        }
        default:
            return state;
    }
};

const sorted = devices =>
    [...devices].sort((a, b) => {
        if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
        }

        return displayedDeviceName(a) < displayedDeviceName(b) ? -1 : 1;
    });

export const getDevice = serialNumber => state =>
    state.device?.devices[serialNumber];

export const sortedDevices = state =>
    sorted(Object.values(state.device.devices));

export const deviceIsSelected = state =>
    state.device?.selectedSerialNumber != null;

export const selectedDevice = state =>
    state.device.devices[state.device.selectedSerialNumber];

export const deviceInfo = state => state.device.deviceInfo;
export const selectedSerialNumber = state => state.device.selectedSerialNumber;
