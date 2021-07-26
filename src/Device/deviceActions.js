/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js'; // eslint-disable-line import/no-unresolved
import nrfDeviceSetup from 'nrf-device-setup';

import logger from '../logging';

/**
 * Indicates that a device has been selected.
 *
 * @param {Object} device Device object as given by nrf-device-lister.
 */
export const DEVICE_SELECTED = 'DEVICE_SELECTED';
export const selectDevice = device => ({
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
 * @param {Object} device Device object as given by nrf-device-lister.
 */
export const DEVICE_SETUP_COMPLETE = 'DEVICE_SETUP_COMPLETE';
const deviceSetupComplete = device => ({
    type: DEVICE_SETUP_COMPLETE,
    device,
});

/**
 * Indicates that device setup failed.
 *
 * @param {Object} device Device object as given by nrf-device-lister.
 * @param {Object} error Error object describing the error.
 */
export const DEVICE_SETUP_ERROR = 'DEVICE_SETUP_ERROR';
const deviceSetupError = (device, error) => ({
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
const deviceSetupInputRequired = (message, choices) => ({
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
const deviceSetupInputReceived = input => ({
    type: DEVICE_SETUP_INPUT_RECEIVED,
    input,
});

/**
 * Indicates that devices have been detected. This is triggered by default at
 * startup, and whenever a device is attached/detached. The app can configure
 * which devices to look for by providing a `config.selectorTraits` property.
 *
 * @param {Array} devices Array of all attached devices, ref. nrf-device-lister.
 */
export const DEVICES_DETECTED = 'DEVICES_DETECTED';
const devicesDetected = devices => ({
    type: DEVICES_DETECTED,
    devices,
});

export const DEVICE_FAVORITE_TOGGLED = 'DEVICE_FAVORITE_TOGGLED';
export const toggleDeviceFavorited = serialNumber => ({
    type: DEVICE_FAVORITE_TOGGLED,
    serialNumber,
});

export const DEVICE_NICKNAME_SET = 'DEVICE_NICKNAME_SET';
export const setDeviceNickname = (serialNumber, nickname) => ({
    type: DEVICE_NICKNAME_SET,
    serialNumber,
    nickname,
});

export const DEVICE_NICKNAME_RESET = 'DEVICE_NICKNAME_RESET';
export const resetDeviceNickname = serialNumber => ({
    type: DEVICE_NICKNAME_RESET,
    serialNumber,
});

let deviceLibContext;

// Defined when user input is required during device setup. When input is
// received from the user, this callback is invoked with the confirmation
// (Boolean) or choice (String) that the user provided as input.
let deviceSetupCallback;

/**
 * Starts watching for devices with the given traits. See the nrf-device-lister
 * library for available traits. Whenever devices are attached/detached, this
 * will dispatch DEVICES_DETECTED with a complete list of attached devices.
 *
 * @param {Object} deviceListing The configuration for the DeviceLister
 * @param {function(device)} doDeselectDevice Invoke to start deselect the current device
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export const startWatchingDevices =
    (deviceListing, doDeselectDevice) => async (dispatch, getState) => {
        const updateDeviceList = async () => {
            if (!deviceLibContext) {
                deviceLibContext = nrfDeviceLib.createContext();
            }

            const devices = await nrfDeviceLib.enumerate(
                deviceLibContext,
                deviceListing
            );

            const state = getState();
            if (
                state.device.selectedSerialNumber !== null &&
                !devices.has(state.device.selectedSerialNumber)
            ) {
                doDeselectDevice();
            }

            const updatedDevices = devices.map(device => {
                // TODO:
                // - s/serialnumber/serialNumber/g
                // - decide where to resolve PCA number, shared / nrf-device-lib
                delete Object.assign(device, {
                    serialNumber: device.serialnumber,
                    boardVersion: device.jlink
                        ? device.jlink.board_version
                        : undefined,
                }).serialnumber;
                return device;
            });

            dispatch(devicesDetected(updatedDevices));
        };

        try {
            await updateDeviceList();
            nrfDeviceLib.startHotplugEvents(
                deviceLibContext,
                () => {},
                () => {
                    updateDeviceList();
                }
            );
        } catch (error) {
            logger.error(`Error while probing devices: ${error.message}`);
        }
    };

/**
 * Stops watching for devices.
 *
 * @returns {undefined}
 */
export const stopWatchingDevices = () => {
    if (deviceLibContext) {
        try {
            nrfDeviceLib.releaseContext(deviceLibContext);
        } catch (error) {
            logger.error(
                `Error while releasing nrf-device-lib-js: ${error.message}`
            );
        } finally {
            deviceLibContext = undefined;
        }
    }
};

/**
 * Asks the user to provide input during device setup. If a list of choices are
 * given, and the user selects one of them, then then promise will resolve with
 * the selected value. If no choices are given, and the user confirms, then the
 * promise will just resolve with true. Will reject if the user cancels.
 *
 * @param {function} dispatch The redux dispatch function.
 * @param {String} message The message to display to the user.
 * @param {Array<String>} [choices] The choices to display to the user (optional).
 * @returns {Promise<String>} Promise that resolves with the user input.
 */
const getDeviceSetupUserInput = dispatch => (message, choices) =>
    new Promise((resolve, reject) => {
        deviceSetupCallback = choice => {
            if (!choices) {
                // for confirmation resolve with boolean
                resolve(!!choice);
            } else if (choice) {
                resolve(choice);
            } else {
                reject(new Error('Cancelled by user.'));
            }
        };
        dispatch(deviceSetupInputRequired(message, choices));
    });

/**
 * Selects a device and sets it up for use according to the `config.deviceSetup`
 * configuration given by the app.
 *
 * @param {Object} device Device object, ref. nrf-device-lister.
 * @param {Object} deviceSetup The object describing how to do the device setup
 * @param {function()} releaseCurrentDevice Callback invoked after stopping watching for devices
 *                     and before setting up the new device
 * @param {function(device)} onDeviceIsReady Callback invoked with the device when setup is complete
 * @param {function(device)} doStartWatchingDevices Invoke to start watching for new devices
 * @param {function(device)} doDeselectDevice Invoke to start deselect the current device
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export const setupDevice =
    (
        device,
        deviceSetup,
        releaseCurrentDevice,
        onDeviceIsReady,
        doStartWatchingDevices,
        doDeselectDevice
    ) =>
    async dispatch => {
        // During device setup, the device may go in and out of bootloader
        // mode. This will make it appear as detached in the device lister,
        // causing a DESELECT_DEVICE. To avoid this, we stop the device
        // lister while setting up the device, and start it again after the
        // device has been set up.
        stopWatchingDevices();
        await releaseCurrentDevice();
        const deviceSetupConfig = {
            promiseConfirm: getDeviceSetupUserInput(dispatch),
            promiseChoice: getDeviceSetupUserInput(dispatch),
            allowCustomDevice: false,
            ...deviceSetup,
        };

        nrfDeviceSetup
            .setupDevice(device, deviceSetupConfig)
            .then(preparedDevice => {
                doStartWatchingDevices();
                dispatch(deviceSetupComplete(preparedDevice));
                onDeviceIsReady(preparedDevice);
            })
            .catch(error => {
                dispatch(deviceSetupError(device, error));
                if (!deviceSetupConfig.allowCustomDevice) {
                    logger.error(
                        `Error while setting up device ${device.serialNumber}: ${error.message}`
                    );
                    doDeselectDevice();
                }
                doStartWatchingDevices();
            });
    };

/**
 * Responds to a device setup confirmation request with the given input
 * as provided by the user.
 *
 * @param {Boolean|String} input Input made by the user.
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export const receiveDeviceSetupInput = input => dispatch => {
    dispatch(deviceSetupInputReceived(input));
    if (deviceSetupCallback) {
        deviceSetupCallback(input);
        deviceSetupCallback = undefined;
    } else {
        logger.error('Received device setup input, but no callback exists.');
    }
};
