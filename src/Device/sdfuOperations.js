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
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import fs from 'fs';
import MemoryMap from 'nrf-intel-hex';
import SerialPort from 'serialport';

import logger from '../logging';
import { deviceLibContext, waitForDevice } from './deviceLister';
import {
    createInitPacketBuffer,
    defaultInitPacket,
    FwType,
    HashType,
} from './initPacket';

const NORDIC_DFU_PRODUCT_ID = 0x521f;
const NORDIC_VENDOR_ID = 0x1915;
const DEFAULT_DEVICE_WAIT_TIME = 10000;

export const isDeviceInDFUBootloader = device => {
    if (!device) {
        return false;
    }
    if (device.usb) {
        const { descriptor: d } = device.usb.device;
        return (
            d.idVendor === NORDIC_VENDOR_ID &&
            d.idProduct === NORDIC_DFU_PRODUCT_ID
        );
    }
    if (device.serialport) {
        const { vendorId, productId } = device.serialport;
        return vendorId === '1915' && productId.toUpperCase() === '521F';
    }
    return false;
};

/**
 * Trigger DFU Bootloader mode if the device is not yet in that mode.
 *
 * @param {Object} device device
 * @returns {Promise<Object>} device object which is already in bootloader.
 */
export const ensureBootloaderMode = async device => {
    if (isDeviceInDFUBootloader(device)) {
        logger.debug('Device is in bootloader mode');
        return device;
    }
    return device;

    // TODO
    // let usbdev = device.usb;
    // let retry = 0;
    // while (!usbdev && retry < 3) {
    //     retry += 1;
    //     debug('missing usb, looking for it again');
    //     /* eslint-disable-next-line no-await-in-loop */
    //     usbdev = await waitForDevice(serialNumber, DEFAULT_DEVICE_WAIT_TIME, ['nordicUsb']).usb;
    // }
    // if (!usbdev) {
    //     throw new Error('Couldn`t recognize expected nordic usb device');
    // }
    // debug('Trying to trigger bootloader mode');
    // return detachAndWaitFor(
    //     usbdev.device,
    //     getDFUInterfaceNumber(device.usb.device),
    //     serialNumber,
    // );
};

/**
 * Procedure of checking firmware version of the currently running bootloader,
 * in case it's not the latest - after confirmation - it is updated.
 *
 * @param {Object} device device
 * @param {function} promiseConfirm funtion that returns Promise<boolean> for confirmation
 * @returns {Promise<Object>} updated device
 */
const checkConfirmUpdateBootloader = async (device, promiseConfirm) => {
    if (!promiseConfirm) {
        // without explicit consent bootloader will not be updated
        return device;
    }
    return device;
    // TODO
    // const bootloaderVersion = await getBootloaderVersion(device);
    // if (bootloaderVersion >= LATEST_BOOTLOADER_VERSION) {
    //     return device;
    // }
    // if (!await promiseConfirm('Newer version of the bootloader is available, do you want to update it?')) {
    //     debug('Continuing with old bootloader');
    //     return device;
    // }
    // return updateBootloader(device);
};

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
 * Helper function that calls optional user defined choice e.g. dialog or inquirer.
 *
 * @param {array} choices array of choices
 * @param {function} promiseChoice Promise returning function
 * @returns {Promise} resolves to user selected choice or first element
 */
const choiceHelper = async (choices, promiseChoice) => {
    if (choices.length > 1 && promiseChoice) {
        return promiseChoice('Which firmware do you want to program?', choices);
    }
    return choices.pop();
};

/**
 * Loads firmware image from HEX file
 *
 * @param {Buffer|string} firmware contents of HEX file if Buffer otherwise path of HEX file
 * @returns {Uint8Array} the loaded firmware
 */
function parseFirmwareImage(firmware) {
    const contents =
        firmware instanceof Buffer ? firmware : fs.readFileSync(firmware);
    const memMap = MemoryMap.fromHex(contents);
    let startAddress;
    let endAddress;
    memMap.forEach((block, address) => {
        startAddress = !startAddress ? address : startAddress;
        endAddress = address + block.length;
    });
    return memMap.slicePad(
        startAddress,
        Math.ceil((endAddress - startAddress) / 4) * 4
    );
}

/**
 * Aux function. Returns a promise that resolves after the given time.
 *
 * @param {number} ms Time, in milliseconds, to wait until promise resolution
 * @returns {Promise<undefined>} Promise that resolves after a time
 */
const sleep = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Ensures that device has a serialport that is ready to be opened
 * @param {object} device nrf-device-lister's device
 * @param {boolean} needSerialport indicates if the device is expected to have a serialport
 * @returns {Promise} resolved to device
 */
const validateSerialPort = async (device, needSerialport) => {
    if (!needSerialport) {
        logger.debug('device does not need serialport');
        return device;
    }

    const checkOpen = serialPath =>
        new Promise(resolve => {
            const port = new SerialPort(
                serialPath,
                { baudRate: 115200 },
                err => {
                    if (!err) port.close();
                    resolve(!err);
                }
            );
        });

    for (let i = 10; i > 1; i -= 1) {
        /* eslint-disable-next-line no-await-in-loop */
        await sleep(2000 / i);
        // logger.debug('validating serialport', device.serialport.path, i);
        /* eslint-disable-next-line no-await-in-loop */
        if (await checkOpen(device.serialport.comName)) {
            logger.debug('resolving', device);
            return device;
        }
    }
    throw new Error('Could not open serialport');
};

/**
 * Calculates SHA256 hash of image
 *
 * @param {Uint8Array} image to calculate hash from
 * @returns {Buffer} SHA256 hash
 */
function calculateSHA256Hash(image) {
    const digest = createHash('sha256');
    digest.update(image);
    return Buffer.from(digest.digest().reverse());
}

/**
 * Create DFU data from prepared DFU images
 *
 * @param {Array} dfuImages to be created
 * @returns {Object} DFU data
 */
const createDfuDataFromImages = dfuImages => {
    const extract = image => ({
        bin: image.firmwareImage,
        dat: createInitPacketBuffer(
            image.initPacket.fwVersion,
            image.initPacket.hwVersion,
            image.initPacket.sdReq,
            image.initPacket.fwType,
            image.initPacket.sdSize,
            image.initPacket.blSize,
            image.initPacket.appSize,
            image.initPacket.hashType,
            image.initPacket.hash,
            image.initPacket.isDebug,
            image.initPacket.signatureType,
            image.initPacket.signature
        ),
    });

    const application = dfuImages.find(i => i.name === 'Application');
    const softdevice = dfuImages.find(i => i.name === 'SoftDevice');

    return {
        application: application && extract(application),
        softdevice: softdevice && extract(softdevice),
    };
};

/**
 * Create DFU zip from prepared DFU images
 *
 * @param {Array} dfuImages to be created
 * @returns {Object} zip
 */
const createDfuZip = dfuImages => {
    return new Promise(resolve => {
        const data = createDfuDataFromImages(dfuImages);
        const zip = new AdmZip();
        const manifest = {};

        if (data.application) {
            manifest.application = {
                bin_file: 'application.bin',
                dat_file: 'application.dat',
            };
            zip.addFile('application.bin', data.application.bin);
            zip.addFile('application.dat', data.application.dat);
        }

        if (data.softdevice) {
            manifest.softdevice = {
                bin_file: 'softdevice.bin',
                dat_file: 'softdevice.dat',
            };
            zip.addFile('softdevice.bin', data.softdevice.bin);
            zip.addFile('softdevice.dat', data.softdevice.dat);
        }

        const manifestJson = JSON.stringify({ manifest });
        const manifestBuffer = Buffer.alloc(manifestJson.length, manifestJson);
        zip.addFile('manifest.json', manifestBuffer);

        resolve(zip);
    });
};

/**
 * Create DFU zip buffer from prepared DFU images
 *
 * @param {Array} dfuImages to be created
 * @returns {Buffer} buffer
 */
const createDfuZipBuffer = async dfuImages => {
    const zip = await createDfuZip(dfuImages);
    const buffer = zip.toBuffer();
    return buffer;
};

/**
 * Prepares a device which is expected to be in DFU Bootloader.
 * First it loads the firmware from HEX file specified by dfu argument,
 * then performs the DFU operation.
 * This causes the device to be detached, so finally it waits for it to be attached again.
 *
 * @param {object} device nrf-device-lister's device
 * @param {object} dfu configuration object for performing the DFU
 * @returns {Promise} resolved to prepared device
 */
const prepareInDFUBootloader = async (device, dfu) => {
    logger.debug(
        `${device.serialNumber} on ${device.serialport.comName} is now in DFU-Bootloader...`
    );

    const { application, softdevice } = dfu;
    let { params } = dfu;
    params = params || {};

    const dfuImages = [];
    if (softdevice) {
        const firmwareImage = parseFirmwareImage(softdevice);

        const initPacketParams = {
            fwType: FwType.SOFTDEVICE,
            fwVersion: 0xffffffff,
            hwVersion: params.hwVersion || 52,
            hashType: HashType.SHA256,
            hash: calculateSHA256Hash(firmwareImage),
            sdSize: firmwareImage.length,
            sdReq: params.sdReq || [],
        };

        const packet = { ...defaultInitPacket, ...initPacketParams };
        dfuImages.push({
            name: 'SoftDevice',
            initPacket: packet,
            firmwareImage,
        });
    }

    const firmwareImage = parseFirmwareImage(application);

    const initPacketParams = {
        fwType: FwType.APPLICATION,
        fwVersion: params.fwVersion || 4,
        hwVersion: params.hwVersion || 52,
        hashType: HashType.SHA256,
        hash: calculateSHA256Hash(firmwareImage),
        appSize: firmwareImage.length,
        sdReq: params.sdId || [],
    };

    const packet = { ...defaultInitPacket, ...initPacketParams };
    dfuImages.push({ name: 'Application', initPacket: packet, firmwareImage });

    const zipBuffer = await createDfuZipBuffer(dfuImages);
    fs.writeFileSync('tem.zip', zipBuffer);

    let prevPercentage;

    logger.debug('Starting DFU');
    await new Promise(resolve =>
        nrfDeviceLib.firmwareProgram(
            deviceLibContext,
            device.id,
            'NRFDL_FW_BUFFER',
            'NRFDL_FW_SDFU_ZIP',
            zipBuffer,
            err => {
                if (err) {
                    logger.error(
                        `Failed to write to the target device: ${
                            err.message || err
                        }`
                    );
                } else {
                    logger.info(
                        'All dfu images have been written to the target device'
                    );
                    logger.debug('DFU completed successfully!');
                    resolve();
                }
            },
            ({ progressJson: progress }) => {
                // // Don't repeat percentage steps that have already been logged.
                // if (prevPercentage !== progress.progress_percentage) {
                //     const status = `${progress.message.replace('.', ':')} ${
                //         progress.progress_percentage
                //     }%`;
                //     logger.info(status);
                //     prevPercentage = progress.progress_percentage;
                // }
            }
        )
    );

    return waitForDevice(device.serialNumber, DEFAULT_DEVICE_WAIT_TIME, {
        serialport: true,
        nordicUsb: true,
    });
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
 * DFU procedure which also tries to update bootloader in case bootloader mode is
 * set during the process and it happens to be outdated.
 *
 * @param {Object} selectedDevice device
 * @param {Object} options options
 * @returns {Promise} device or { device, details } object
 */
export const performDFU = async (selectedDevice, options) => {
    const {
        dfu,
        needSerialport,
        detailedOutput,
        promiseConfirm,
        promiseConfirmBootloader,
        promiseChoice,
    } = options;
    const isConfirmed = await confirmHelper(promiseConfirm);
    if (!isConfirmed) {
        // go on without DFU
        return createReturnValue(
            selectedDevice,
            { wasProgrammed: false },
            detailedOutput
        );
    }
    const choice = await choiceHelper(Object.keys(dfu), promiseChoice);

    try {
        let device = await ensureBootloaderMode(selectedDevice);
        device = await checkConfirmUpdateBootloader(
            device,
            promiseConfirmBootloader || promiseConfirm
        );
        device = await ensureBootloaderMode(device);
        device = await prepareInDFUBootloader(device, dfu[choice]);
        device = await validateSerialPort(device, needSerialport);

        logger.debug('DFU finished: ', device);
        return createReturnValue(
            device,
            { wasProgrammed: true },
            detailedOutput
        );
    } catch (err) {
        logger.debug('DFU failed: ', err);
        throw err;
    }
};
