/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import logger from '../logging';
import { Device, TDispatch } from '../state';
import { stopWatchingDevices } from './deviceLister';
import {
    deviceSetupComplete,
    deviceSetupError,
    deviceSetupInputReceived,
    deviceSetupInputRequired,
} from './deviceSlice';
import { InitPacket } from './initPacket';
import {
    programFirmware,
    validateFirmware,
    verifySerialPortAvailable,
} from './jprogOperations';
import {
    isDeviceInDFUBootloader,
    performDFU,
    PromiseChoice,
    PromiseConfirm,
} from './sdfuOperations';

export interface DfuEntry {
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}
export interface DeviceSetup {
    dfu: {
        [key: string]: DfuEntry;
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

// Defined when user input is required during device setup. When input is
// received from the user, this callback is invoked with the confirmation
// (Boolean) or choice (String) that the user provided as input.
let deviceSetupCallback: ((choice: string | boolean) => void) | undefined;

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
        new Promise<boolean | string>((resolve, reject) => {
            deviceSetupCallback = (choice: boolean | string) => {
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
    (input: boolean | string) => (dispatch: TDispatch) => {
        dispatch(deviceSetupInputReceived());
        if (deviceSetupCallback) {
            deviceSetupCallback(input);
            deviceSetupCallback = undefined;
        } else {
            logger.error(
                'Received device setup input, but no callback exists.'
            );
        }
    };

export interface DeviceSetupConfig extends DeviceSetup {
    allowCustomDevice: boolean;
    promiseChoice: PromiseChoice;
    promiseConfirm: PromiseConfirm;
}

export const prepareDevice = async (
    device: Device,
    deviceSetupConfig: DeviceSetupConfig
): Promise<Device> => {
    const { jprog, dfu, needSerialport } = deviceSetupConfig;

    if (dfu && Object.keys(dfu).length > 0) {
        // Check if device is in DFU-Bootloader, it might only have serialport
        if (isDeviceInDFUBootloader(device)) {
            logger.debug('Device is in DFU-Bootloader, DFU is defined');
            return performDFU(device, deviceSetupConfig);
        }

        if (device.dfuTriggerVersion) {
            logger.debug(
                'Device has DFU trigger interface, the device is in Application mode'
            );

            const { semVer } = device.dfuTriggerVersion;

            if (
                Object.keys(dfu)
                    .map(key => dfu[key].semver)
                    .includes(semVer)
            ) {
                return device;
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
        if (valid) return device;

        try {
            return await programFirmware(device, fw, deviceSetupConfig);
        } catch (error) {
            throw new Error('Failed to program firmware');
        }
    }

    return device;
};

const onSuccessfulDeviceSetup = (
    dispatch: TDispatch,
    device: Device,
    doStartWatchingDevices: () => void,
    onDeviceIsReady: (device: Device) => void
) => {
    doStartWatchingDevices();
    dispatch(deviceSetupComplete(device));
    onDeviceIsReady(device);
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
        onDeviceIsReady: (device: Device) => void,
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
            promiseConfirm: getDeviceSetupUserInput(dispatch) as PromiseConfirm,
            promiseChoice: getDeviceSetupUserInput(dispatch) as PromiseChoice,
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
                    device,
                    doStartWatchingDevices,
                    onDeviceIsReady
                );
            } else {
                logger.logError(
                    `Error while setting up device ${device.serialNumber}`,
                    error
                );
                doDeselectDevice();
            }
            doStartWatchingDevices();
        }
    };
