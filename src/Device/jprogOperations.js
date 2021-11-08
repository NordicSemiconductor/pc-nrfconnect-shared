/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js';
import SerialPort from 'serialport';

import logger from '../logging';
import { getDeviceLibContext } from './deviceLister';

const deviceLibContext = getDeviceLibContext();

/**
 * Program the device with the given serial number with the given firmware
 * using nrf-device-lib-js
 *
 * @param {String|Number} deviceId The Id of the device.
 * @param {String|Buffer} firmware Firmware path or firmware contents as buffer.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
const program = (deviceId, firmware) => {
    let fwFormat;
    const options = {};
    if (firmware instanceof Buffer) {
        const INPUT_FORMAT_HEX_STRING = 1;
        options.inputFormat = INPUT_FORMAT_HEX_STRING;
        fwFormat = 'NRFDL_FW_BUFFER';
    } else {
        fwFormat = 'NRFDL_FW_FILE';
    }
    return new Promise((resolve, reject) => {
        nrfDeviceLib.firmwareProgram(
            deviceLibContext,
            deviceId,
            fwFormat,
            'NRFDL_FW_INTEL_HEX',
            firmware,
            err => {
                if (err) reject(err);
                logger.info('Device programming completed.');
                resolve();
            },
            ({ progressJson: progress }) => {
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
const reset = async deviceId => {
    await nrfDeviceLib.deviceControlReset(deviceLibContext, deviceId);
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
const verifySerialPortAvailable = device => {
    if (!device.serialport) {
        return Promise.reject(
            new Error(
                'No serial port available for device with ' +
                    `serial number ${device.serialNumber}`
            )
        );
    }
    return new Promise((resolve, reject) => {
        const serialPort = new SerialPort(device.serialport.comName, {
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
async function validateFirmware(device, fwVersion) {
    let valid = false;
    let fwInfo;
    try {
        fwInfo = await nrfDeviceLib.readFwInfo(deviceLibContext, device.id);
    } catch (error) {
        return false;
    }
    if (
        typeof fwVersion === 'object' &&
        typeof fwVersion.validator === 'function'
    ) {
        valid = fwVersion.validator(fwInfo.imageInfoList, true);
    } else {
        valid = fwInfo.imageInfoList.find(imageInfo => {
            if (imageInfo.versionFormat !== 'string') return false;
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
const confirmHelper = async promiseConfirm => {
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
async function programFirmware(device, fw, deviceSetupConfig) {
    try {
        const confirmed = await confirmHelper(deviceSetupConfig.promiseConfirm);
        if (!confirmed) return undefined;

        logger.debug(`Programming ${device.serialNumber} with ${fw}`);
        await program(device.id, fw);
        logger.debug(`Resetting ${device.serialNumber}`);
        await reset(device.id);
    } catch (programError) {
        logger.error(programError);
        throw new Error(`Error when programming ${programError.message}`);
    }
    return device;
}

export { verifySerialPortAvailable, validateFirmware, programFirmware };
