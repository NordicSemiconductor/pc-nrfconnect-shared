/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
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
    let fw;
    const options = {};
    if (firmware instanceof Buffer) {
        fw = firmware.toString('utf-8');
        const INPUT_FORMAT_HEX_STRING = 1;
        options.inputFormat = INPUT_FORMAT_HEX_STRING;
    } else {
        fw = firmware;
    }
    return new Promise((resolve, reject) => {
        nrfDeviceLib.firmwareProgram(
            deviceLibContext,
            deviceId,
            'NRFDL_FW_FILE',
            'NRFDL_FW_INTEL_HEX',
            fw,
            err => {
                if (err) reject(err);
                logger.info('Device programming completed.');
                resolve();
            },
            ({ progressJson: progress }) => {
                const status = `${progress.message.replace('.', ':')} ${
                    progress.progress_percentage
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
    try {
        const fwInfo = await nrfDeviceLib.readFwInfo(
            deviceLibContext,
            device.id
        );
        if (
            typeof fwVersion === 'object' &&
            typeof fwVersion.validator === 'function'
        ) {
            valid = fwVersion.validator(fwInfo.imageInfoList);
        } else {
            valid = fwInfo.imageInfoList.find(imageInfo => {
                if (!imageInfo.version.string) return false;
                return imageInfo.version.string.includes(fwVersion);
            });
        }
        await reset(device.id); // Remove after fixing in nrf-device-lib
        return valid;
    } catch (error) {
        throw new Error(`Error when validating firmware ${error.message}`);
    }
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
        throw new Error(`Error when programming ${programError.message}`);
    }
    return device;
}

export { verifySerialPortAvailable, validateFirmware, programFirmware };
