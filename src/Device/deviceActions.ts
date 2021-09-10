/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// eslint-disable-next-line import/no-unresolved
import { Device } from 'pc-nrfconnect-shared';

/**
 * Indicates that a device has been selected.
 *
 * @param {Device} device Device object as given by nrf-device-lib.
 */
export const DEVICE_SELECTED = 'DEVICE_SELECTED';
export const selectDevice = (device: Device) => ({
    type: DEVICE_SELECTED,
    device,
});

/**
 * Indicates that the currently selected device has been deselected.
 */
export const DEVICE_DESELECTED = 'DEVICE_DESELECTED';
export function deselectDevice() {
    return {
        type: DEVICE_DESELECTED,
    };
}

/**
 * Indicates that device setup is complete. This means that the device is
 * ready for use according to the `config.deviceSetup` configuration provided
 * by the app.
 *
 * @param {Object} device Device object as given by nrf-device-lib.
 */
export const DEVICE_SETUP_COMPLETE = 'DEVICE_SETUP_COMPLETE';
export const deviceSetupComplete = (device: Device) => ({
    type: DEVICE_SETUP_COMPLETE,
    device,
});

/**
 * Indicates that device setup failed.
 *
 * @param {Object} device Device object as given by nrf-device-lib.
 * @param {Object} error Error object describing the error.
 */
export const DEVICE_SETUP_ERROR = 'DEVICE_SETUP_ERROR';
export const deviceSetupError = (device: Device, error: Error) => ({
    type: DEVICE_SETUP_ERROR,
    device,
    error,
});

/**
 * Indicates that some part of the device setup operation requires input
 * from the user. When the user has provided the required input, then
 * DEVICE_SETUP_INPUT_RECEIVED is dispatched with the given input.
 *
 * @param {String} message The message to display to the user.
 * @param {Array<String>} [choices] Values that the user can choose from (optional).
 */
export const DEVICE_SETUP_INPUT_REQUIRED = 'DEVICE_SETUP_INPUT_REQUIRED';
export const deviceSetupInputRequired = (
    message: string,
    choices: string[]
) => ({
    type: DEVICE_SETUP_INPUT_REQUIRED,
    message,
    choices,
});

/**
 * Indicates that the user has provided input to the device setup operation.
 * This action is dispatched after DEVICE_SETUP_INPUT_REQUIRED.
 *
 * @param {Boolean|String} input The input made by the user.
 */
export const DEVICE_SETUP_INPUT_RECEIVED = 'DEVICE_SETUP_INPUT_RECEIVED';
export const deviceSetupInputReceived = (input: boolean | string) => ({
    type: DEVICE_SETUP_INPUT_RECEIVED,
    input,
});

/**
 * Indicates that devices have been detected. This is triggered by default at
 * startup, and whenever a device is attached/detached. The app can configure
 * which devices to look for by providing a `config.selectorTraits` property.
 *
 * @param {Array} devices Array of all attached devices, ref. nrf-device-lib.
 */
export const DEVICES_DETECTED = 'DEVICES_DETECTED';
export const devicesDetected = (devices: Device[]) => ({
    type: DEVICES_DETECTED,
    devices,
});

export const DEVICE_FAVORITE_TOGGLED = 'DEVICE_FAVORITE_TOGGLED';
export const toggleDeviceFavorited = (serialNumber: string) => ({
    type: DEVICE_FAVORITE_TOGGLED,
    serialNumber,
});

export const DEVICE_NICKNAME_SET = 'DEVICE_NICKNAME_SET';
export const setDeviceNickname = (serialNumber: string, nickname: string) => ({
    type: DEVICE_NICKNAME_SET,
    serialNumber,
    nickname,
});

export const DEVICE_NICKNAME_RESET = 'DEVICE_NICKNAME_RESET';
export const resetDeviceNickname = (serialNumber: string) => ({
    type: DEVICE_NICKNAME_RESET,
    serialNumber,
});
