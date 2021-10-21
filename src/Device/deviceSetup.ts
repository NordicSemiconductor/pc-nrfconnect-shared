/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import logger from '../logging';
import { Device, DeviceInfo, TDispatch } from '../state';
import { deviceInfo } from './deviceInfo/deviceInfo';
import { stopWatchingDevices } from './deviceLister';
import {
    deviceSetupComplete,
    deviceSetupError,
    deviceSetupInputReceived,
    deviceSetupInputRequired,
} from './deviceSlice';
import {
    programFirmware,
    validateFirmware,
    verifySerialPortAvailable,
} from './jprogOperations';
import { isDeviceInDFUBootloader, performDFU } from './sdfuOperations';

// Defined when user input is required during device setup. When input is
// received from the user, this callback is invoked with the confirmation
// (Boolean) or choice (String) that the user provided as input.
let deviceSetupCallback: ((choice: boolean) => void) | undefined;

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
const getDeviceSetupUserInput =
    (dispatch: TDispatch) => (message: string, choices: string[]) =>
        new Promise<boolean>((resolve, reject) => {
            deviceSetupCallback = (choice: boolean) => {
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
export const receiveDeviceSetupInput =
    (input: boolean) => (dispatch: TDispatch) => {
        dispatch(deviceSetupInputReceived(input));
        if (deviceSetupCallback) {
            deviceSetupCallback(input);
            deviceSetupCallback = undefined;
        } else {
            logger.error(
                'Received device setup input, but no callback exists.'
            );
        }
    };

const createReturnValue = (
    device: Device,
    details: { wasProgrammed: boolean }
) => ({ device, details });

export interface DeviceSetup {
    dfu: {
        [key: string]: {
            application: string;
            semver: string;
        };
    };
    jprog: {
        [key: string]: {
            fw: string;
            fwIdAddress: number;
            fwVersion: string;
        };
    };
    needSerialport: boolean;
}

export interface DeviceSetupConfig extends DeviceSetup {
    allowCustomDevice: boolean;
    promiseChoice: (message: string, choices: string[]) => void;
    promiseConfirm: (message: string, choices?: string[]) => Promise<boolean>;
    detailedOutput?: boolean;
}

export const prepareDevice = async (
    device: Device,
    deviceSetupConfig: DeviceSetupConfig
): Promise<Device> => {
    const { jprog, dfu, needSerialport, detailedOutput } = deviceSetupConfig;

    let wasProgrammed = false;
    if (dfu && Object.keys(dfu).length > 0) {
        // Check if device is in DFU-Bootloader, it might only have serialport
        if (isDeviceInDFUBootloader(device)) {
            logger.debug('Device is in DFU-Bootloader, DFU is defined');
            return performDFU(device, deviceSetupConfig);
        }

        if (device.dfuTriggerInfo) {
            logger.debug(
                'Device has DFU trigger interface, the device is in Application mode'
            );

            const { semVer } = device.dfuTriggerVersion;
            if (
                Object.keys(dfu)
                    .map(key => dfu[key].semver)
                    .includes(semVer)
            ) {
                return createReturnValue(
                    device,
                    { wasProgrammed },
                    detailedOutput
                );
            }
            return performDFU(device, deviceSetupConfig);
        }
    }

    if (jprog && device.traits.jlink) {
        if (needSerialport) await verifySerialPortAvailable(device);
        const family = (device.jlink?.deviceFamily || '').toLowerCase();
        const deviceType = (device.jlink?.deviceVersion || '').toLowerCase();
        const shortDeviceType = deviceType.split('_').shift();
        const boardVersion = (device.jlink?.boardVersion || '').toLowerCase();

        const key =
            Object.keys(jprog).find(k => k.toLowerCase() === deviceType) ||
            Object.keys(jprog).find(k => k.toLowerCase() === shortDeviceType) ||
            Object.keys(jprog).find(k => k.toLowerCase() === boardVersion) ||
            Object.keys(jprog).find(k => k.toLowerCase() === family);

        if (!key) {
            throw new Error('No firmware defined for selected device');
        }

        logger.debug('Found matching firmware definition', key);
        const { fw, fwVersion } = jprog[key];
        const valid = await validateFirmware(device, fwVersion);
        if (valid)
            return createReturnValue(device, { wasProgrammed }, detailedOutput);

        try {
            const programmedDevice = await programFirmware(
                device,
                fw,
                deviceSetupConfig
            );
            if (programmedDevice === undefined) throw new Error();

            wasProgrammed = true;
            return createReturnValue(
                programmedDevice,
                { wasProgrammed },
                detailedOutput
            );
        } catch (error) {
            throw new Error('Failed to program firmware');
        }
    }
};

const onSuccessfulDeviceSetup = (
    dispatch: TDispatch,
    info: DeviceInfo,
    doStartWatchingDevices: () => void,
    onDeviceIsReady: (device: DeviceInfo) => void
) => {
    doStartWatchingDevices();
    console.log('info', info);
    dispatch(deviceSetupComplete(info));
    onDeviceIsReady(info);
};

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
        device: Device,
        deviceSetup: DeviceSetup,
        releaseCurrentDevice: () => void,
        onDeviceIsReady: (device: DeviceInfo) => void,
        doStartWatchingDevices: () => void,
        doDeselectDevice: () => void
    ) =>
    async (dispatch: TDispatch) => {
        // During device setup, the device may go in and out of bootloader
        // mode. This will make it appear as detached in the device lister,
        // causing a DESELECT_DEVICE. To avoid this, we stop the device
        // listing while setting up the device, and start it again after the
        // device has been set up.
        stopWatchingDevices();

        await releaseCurrentDevice();
        const deviceSetupConfig: DeviceSetupConfig = {
            promiseConfirm: getDeviceSetupUserInput(dispatch),
            promiseChoice: getDeviceSetupUserInput(dispatch),
            allowCustomDevice: false,
            ...deviceSetup,
        };

        try {
            const preparedDevice = await prepareDevice(
                device,
                deviceSetupConfig
            );
            onSuccessfulDeviceSetup(
                dispatch,
                preparedDevice,
                doStartWatchingDevices,
                onDeviceIsReady
            );
        } catch (error) {
            dispatch(deviceSetupError());
            if (
                deviceSetupConfig.allowCustomDevice &&
                error instanceof Error &&
                error.message.includes('No firmware defined')
            ) {
                logger.info(
                    `Connected to device with serial number: ${device.serialNumber} ` +
                        `and family: ${
                            device.jlink?.deviceFamily || 'Unknown'
                        } `
                );
                logger.info(
                    'Note: no pre-compiled firmware is available for the selected device. ' +
                        'You may still use the app if you have programmed the device ' +
                        'with a compatible firmware.'
                );

                onSuccessfulDeviceSetup(
                    dispatch,
                    deviceInfo(device),
                    doStartWatchingDevices,
                    onDeviceIsReady
                );
            } else {
                const message = error instanceof Error ? error.message : error;
                logger.error(
                    `Error while setting up device ${device.serialNumber}: ${message}`
                );
                doDeselectDevice();
            }
            doStartWatchingDevices();
        }
    };
