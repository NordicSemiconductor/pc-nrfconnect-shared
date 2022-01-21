/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    deviceControlReset,
    Error as nrfError,
    firmwareProgram,
    FirmwareStreamType,
    FWInfo,
    Progress,
    readFwInfo,
} from '@nordicsemiconductor/nrf-device-lib-js';
import SerialPort from 'serialport';

import logger from '../logging';
import { Device } from '../state';
import { getDeviceLibContext } from './deviceLister';
import { DeviceSetupConfig } from './deviceSetup';

const deviceLibContext = getDeviceLibContext();

/**
 * Program the device with the given serial number with the given firmware
 * using nrf-device-lib-js
 *
 * @param {String|Number} deviceId The Id of the device.
 * @param {String|Buffer} firmware Firmware path or firmware contents as buffer.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
const program = (deviceId: number, firmware: string | Buffer) => {
    let fwFormat: FirmwareStreamType;
    if (firmware instanceof Buffer) {
        fwFormat = 'NRFDL_FW_BUFFER';
    } else {
        fwFormat = 'NRFDL_FW_FILE';
    }
    return new Promise<void>((resolve, reject) => {
        firmwareProgram(
            deviceLibContext,
            deviceId,
            fwFormat,
            'NRFDL_FW_INTEL_HEX',
            firmware,
            (error?: nrfError) => {
                if (error) reject(error);
                logger.info('Device programming completed.');
                resolve();
            },
            ({ progressJson: progress }: Progress.CallbackParameters) => {
                const status = `${progress.message.replace('.', ':')} ${
                    progress.progressPercentage
                }%`;
                logger.info(status);
            },
            null,
            'NRFDL_DEVICE_CORE_APPLICATION'
        );
    });
};

/**
 * Reset the device after programming
 *
 * @param {Number} deviceId The Id of the device.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
const reset = async (deviceId: number) => {
    await deviceControlReset(deviceLibContext, deviceId);
};

/**
 * Try to open and close the given serial port to see if it is available. This
 * is needed to identify if a SEGGER J-Link device is in a bad state. If
 * pc-nrfjprog-js tries to interact with a device in bad state, it will hang
 * indefinitely.
 *
 * @param {object} device Device object, ref. nrf-device-lister.
 * @returns {Promise} Promise that resolves if available, and rejects if not.
 */
export const verifySerialPortAvailable = (device: Device) => {
    if (!device.serialport) {
        return Promise.reject(
            new Error(
                'No serial port available for device with ' +
                    `serial number ${device.serialNumber}`
            )
        );
    }
    return new Promise<void>((resolve, reject) => {
        if (!device.serialport?.comName) return reject();
        const serialPort = new SerialPort(device.serialport?.comName, {
            autoOpen: false,
        });
        serialPort.open(openErr => {
            if (openErr) {
                reject(openErr);
            } else {
                serialPort.close(closeErr => {
                    if (closeErr) {
                        reject(closeErr);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

/**
 * Validate the firmware on the device whether it matches the provided firmware or not
 *
 * @param {Device} device The device to be validated.
 * @param {String} fwVersion The firmware version to be matched.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
export async function validateFirmware(
    device: Device,
    fwVersion:
        | string
        | {
              validator: (
                  imageInfoList: FWInfo.Image[],
                  fromDeviceLib: boolean
              ) => boolean;
          }
) {
    let valid: boolean | FWInfo.Image | undefined = false;
    let fwInfo: FWInfo.ReadResult;
    try {
        fwInfo = await readFwInfo(deviceLibContext, device.id);
    } catch (error) {
        return false;
    }
    if (
        typeof fwVersion === 'object' &&
        typeof fwVersion.validator === 'function'
    ) {
        valid = fwVersion.validator(fwInfo.imageInfoList, true);
    } else if (typeof fwVersion === 'string') {
        valid = fwInfo.imageInfoList.find(imageInfo => {
            if (typeof imageInfo.version !== 'string') return false;
            return imageInfo.version.includes(fwVersion);
        });
    }
    return valid;
}

/**
 * Helper function that calls optional user defined confirmation e.g. dialog or inquirer.
 *
 * @param {function} promiseConfirm Promise returning function
 * @returns {Promise} resolves to boolean
 */
const confirmHelper = async (
    promiseConfirm: (message: string) => Promise<boolean>
) => {
    if (!promiseConfirm) return true;
    try {
        return await promiseConfirm(
            'Device must be programmed, do you want to proceed?'
        );
    } catch (err) {
        throw new Error('Preparation cancelled by user');
    }
};

/**
 * Program the device with the given serial number with the given firmware with provided configuration
 *
 * @param {Device} device The device to be programmed.
 * @param {Object} fw Firmware path or firmware contents as buffer.
 * @param {Object} deviceSetupConfig The configuration provided.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
export async function programFirmware(
    device: Device,
    fw: string | Buffer,
    deviceSetupConfig: DeviceSetupConfig
) {
    try {
        const confirmed = await confirmHelper(deviceSetupConfig.promiseConfirm);
        if (!confirmed) return device;

        logger.debug(`Programming ${device.serialNumber} with ${fw}`);
        await program(device.id, fw);
        logger.debug(`Resetting ${device.serialNumber}`);
        await reset(device.id);
    } catch (programError) {
        if (programError instanceof Error) {
            logger.error(programError);
            throw new Error(`Error when programming ${programError.message}`);
        }
    }
    return device;
}
