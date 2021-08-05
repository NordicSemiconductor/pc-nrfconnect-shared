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

import logger from '../logging';
import {
    deviceSetupComplete,
    deviceSetupError,
    deviceSetupInputReceived,
    deviceSetupInputRequired,
} from './deviceActions';
import { stopWatchingDevices } from './deviceLister';
import { programFirmware, verifySerialPortAvailable } from './jprogOperations';
import { isDeviceInDFUBootloader, performDFU } from './sdfuOperations';

// Defined when user input is required during device setup. When input is
// received from the user, this callback is invoked with the confirmation
// (Boolean) or choice (String) that the user provided as input.
let deviceSetupCallback;

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

/**
 * Adds detailed output if enabled in options
 *
 * @param {Object} device device
 * @param {Object} details device
 * @param {boolean} detailedOutput device
 * @returns {Object} Either the device or the {device, details} object
 */
const createReturnValue = (device, details, detailedOutput) =>
    detailedOutput ? { device, details } : device;

/**
 * Selects a device and sets it up for use according to the `config.deviceSetup`
 * configuration given by the app.
 *
 * @param {Object} device Device object, ref. nrf-device-lib.
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
        // listing while setting up the device, and start it again after the
        // device has been set up.
        let preparedDevice;
        stopWatchingDevices();

        await releaseCurrentDevice();
        const deviceSetupConfig = {
            promiseConfirm: getDeviceSetupUserInput(dispatch),
            promiseChoice: getDeviceSetupUserInput(dispatch),
            allowCustomDevice: false,
            ...deviceSetup,
        };

        const { jprog, dfu, needSerialport, detailedOutput, promiseConfirm } =
            deviceSetupConfig;

        if (dfu && Object.keys(dfu).length !== 0) {
            // check if device is in DFU-Bootloader, it might _only_ have serialport
            if (isDeviceInDFUBootloader(device)) {
                logger.debug('Device is in DFU-Bootloader, DFU is defined');
                preparedDevice = performDFU(device, deviceSetupConfig);
            }
        }
        if (jprog && device.traits.jlink) {
            console.log(jprog);
            console.log(device);
            let wasProgrammed = false;
            if (needSerialport) await verifySerialPortAvailable(device);
            // preparedDevice = getDeviceInfo(device);
            const family = (device.jlink.device_family || '').toLowerCase();
            const deviceType = (
                device.jlink.device_version || ''
            ).toLowerCase();
            const shortDeviceType = deviceType.split('_').shift();
            const boardVersion = (
                device.jlink.board_version || ''
            ).toLowerCase();

            const key =
                Object.keys(jprog).find(k => k.toLowerCase() === deviceType) ||
                Object.keys(jprog).find(
                    k => k.toLowerCase() === shortDeviceType
                ) ||
                Object.keys(jprog).find(
                    k => k.toLowerCase() === boardVersion
                ) ||
                Object.keys(jprog).find(k => k.toLowerCase() === family);
            console.log(key);

            if (!key) {
                throw new Error('No firmware defined for selected device');
            }
            logger.debug('Found matching firmware definition', key);
            const firmwareDefinition = jprog[key];
            // const valid = await validateFirmware(device, firmwareDefinition);
            //         if (valid) {
            //             logger.debug('Application firmware id matches');
            //             return device;
            //         }

            preparedDevice = await programFirmware(
                device,
                firmwareDefinition
            ).then(() => {
                wasProgrammed = true;
            });
            preparedDevice = createReturnValue(
                preparedDevice,
                { wasProgrammed },
                detailedOutput
            );
            // return Promise.resolve()
            //     .then(() => needSerialport && verifySerialPortAvailable(device))
            //     .then(() => openJLink(device))
            //     .then(() => getDeviceInfo(device))
            //     .then(deviceInfo => {
            //         Object.assign(device, { deviceInfo });

            //         const family = (deviceInfo.family || '').toLowerCase();
            //         const deviceType = (
            //             deviceInfo.deviceType || ''
            //         ).toLowerCase();
            //         const shortDeviceType = deviceType.split('_').shift();
            //         const boardVersion = (
            //             device.boardVersion || ''
            //         ).toLowerCase();

            //         const key =
            //             Object.keys(jprog).find(
            //                 k => k.toLowerCase() === deviceType
            //             ) ||
            //             Object.keys(jprog).find(
            //                 k => k.toLowerCase() === shortDeviceType
            //             ) ||
            //             Object.keys(jprog).find(
            //                 k => k.toLowerCase() === boardVersion
            //             ) ||
            //             Object.keys(jprog).find(
            //                 k => k.toLowerCase() === family
            //             );

            //         if (!key) {
            //             throw new Error(
            //                 'No firmware defined for selected device'
            //             );
            //         }
            //         logger.debug('Found matching firmware definition', key);
            //         return jprog[key];
            //     })
            //     .then(async firmwareDefinition => ({
            //         valid: await validateFirmware(device, firmwareDefinition),
            //         firmwareDefinition,
            //     }))
            //     .then(({ valid, firmwareDefinition }) => {
            //         if (valid) {
            //             logger.debug('Application firmware id matches');
            //             return device;
            //         }
            //         return confirmHelper(promiseConfirm).then(isConfirmed => {
            //             if (!isConfirmed) {
            //                 // go on without update
            //                 return device;
            //             }
            //             return programFirmware(device, firmwareDefinition).then(
            //                 () => {
            //                     wasProgrammed = true;
            //                 }
            //             );
            //         });
            //     })
            //     .then(
            //         () => closeJLink(device).then(() => device),
            //         err => closeJLink(device).then(() => Promise.reject(err))
            //     )
            //     .then(() =>
            //         createReturnValue(device, { wasProgrammed }, detailedOutput)
            //     );
        }

        try {
            doStartWatchingDevices();
            dispatch(deviceSetupComplete(preparedDevice));
            onDeviceIsReady(preparedDevice);
        } catch (error) {
            dispatch(deviceSetupError(device, error));
            if (!deviceSetupConfig.allowCustomDevice) {
                logger.error(
                    `Error while setting up device ${device.serialNumber}: ${error.message}`
                );
                doDeselectDevice();
            }
            doStartWatchingDevices();
        }
        // nrfDeviceSetup
        //     .setupDevice(device, deviceSetupConfig)
        //     .then(preparedDevice => {
        //         doStartWatchingDevices();
        //         dispatch(deviceSetupComplete(preparedDevice));
        //         onDeviceIsReady(preparedDevice);
        //     })
        //     .catch(error => {
        //         dispatch(deviceSetupError(device, error));
        //         if (!deviceSetupConfig.allowCustomDevice) {
        //             logger.error(
        //                 `Error while setting up device ${device.serialNumber}: ${error.message}`
        //             );
        //             doDeselectDevice();
        //         }
        //         doStartWatchingDevices();
        //     });
    };
