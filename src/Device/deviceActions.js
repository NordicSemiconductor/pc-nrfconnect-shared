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
import { snakeCase } from 'snake-case';

import logger from '../logging';
import {
    createInitPacketBuffer,
    createInitPacketUint8Array,
    defaultInitPacket,
    FwType,
    HashType,
} from '../utils/initPacket';
import {
    getDeviceInfo,
    programFirmware,
    validateFirmware,
    verifySerialPortAvailable,
} from './jprogFunc';

const NORDIC_DFU_PRODUCT_ID = 0x521f;
const NORDIC_VENDOR_ID = 0x1915;
const DEFAULT_DEVICE_WAIT_TIME = 10000;

/**
 * Indicates that a device has been selected.
 *
 * @param {Object} device Device object as given by nrf-device-lib.
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
 * @param {Object} device Device object as given by nrf-device-lib.
 */
export const DEVICE_SETUP_COMPLETE = 'DEVICE_SETUP_COMPLETE';
const deviceSetupComplete = device => ({
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
 * @param {Array} devices Array of all attached devices, ref. nrf-device-lib.
 */
export const DEVICES_DETECTED = 'DEVICES_DETECTED';
export const devicesDetected = devices => ({
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

const isDeviceInDFUBootloader = device => {
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
    // const { serialNumber } = device;
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
        if (await checkOpen(device.serialports[0].com_name)) {
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
 * Waits until a device (with a matching serial number) is listed by
 * nrf-device-lister, up to a maximum of `timeout` milliseconds.
 *
 * If `expectedTraits` is given, then the device must (in addition to
 * a matching serial number) also have the given traits. See the
 * nrf-device-lister library for the full list of traits.
 *
 * @param {string} serialNumber of the device expected to appear
 * @param {number} [timeout] Timeout, in milliseconds, to wait for device enumeration
 * @param {Array} [expectedTraits] The traits that the device is expected to have
 * @returns {Promise} resolved to the expected device
 */
export const waitForDevice = (
    serialNumber,
    timeout = DEFAULT_DEVICE_WAIT_TIME,
    expectedTraits = ['serialport']
) => {
    logger.debug(`Will wait for device ${serialNumber}`);

    return new Promise((resolve, reject) => {
        let timeoutId;
        // if (!deviceLibContext) {
        //     deviceLibContext = nrfDeviceLib.createContext();
        // }

        // console.log('a');
        // const devices = await nrfDeviceLib.enumerate(deviceLibContext, {
        //     nordicUsb: true,
        //     nordicDfu: true,
        //     serialport: true,
        // });
        // console.log(devices);
        // console.log('b');
        console.log(deviceLibContext);
        nrfDeviceLib.startHotplugEvents(
            deviceLibContext,
            () => {},
            event => {
                const { device } = event;
                const isTraitIncluded = () =>
                    expectedTraits.every(
                        trait => device.traits[snakeCase(trait)]
                    );
                if (
                    device &&
                    device.serialnumber === serialNumber &&
                    isTraitIncluded()
                ) {
                    resolve(device);
                }
            }
        );
        console.log('c');

        // function checkConflation(deviceMap) {
        //     const device = deviceMap.get(serialNumber);
        //     if (
        //         device &&
        //         expectedTraits.every(trait => device.traits.includes(trait))
        //     ) {
        //         clearTimeout(timeoutId);
        //         lister.removeListener('conflated', checkConflation);
        //         lister.removeListener('error', debugError);
        //         lister.stop();
        //         debug(`... found ${serialNumber}`);
        //         resolve(device);
        //     }
        // }

        // timeoutId = setTimeout(() => {
        //     debug(
        //         `Timeout when waiting for attachment of device with serial number ${serialNumber}`
        //     );
        //     lister.removeListener('conflated', checkConflation);
        //     lister.removeListener('error', debugError);
        //     lister.stop();
        //     reject(
        //         new Error(
        //             `Timeout while waiting for device  ${serialNumber} to be attached and enumerated`
        //         )
        //     );
        // }, timeout);

        // lister.on('error', debugError);
        // lister.on('conflated', checkConflation);
        // lister.start();
    });
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
        `${device.serialNumber} on ${device.serialports[0].com_name} is now in DFU-Bootloader...`
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
    console.log(packet);
    dfuImages.push({ name: 'Application', initPacket: packet, firmwareImage });
    console.log(dfuImages);

    const zipBuffer = await createDfuZipBuffer(dfuImages);
    fs.writeFileSync('tem.zip', zipBuffer);

    let prevPercentage;

    logger.debug('Starting DFU');
    console.log(deviceLibContext);
    console.log(device.id);
    console.log(zipBuffer);
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

    return waitForDevice(device.serialNumber, DEFAULT_DEVICE_WAIT_TIME, [
        'serialport',
        'nordicUsb',
    ]);
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
const performDFU = async (selectedDevice, options) => {
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
        // deviceLibContext = nrfDeviceLib.createContext();

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
            //     if (device.usb) {
            //         // const usbDevice = device.usb.device;
            //         if (device.traits.nordic_dfu) {
            //             logger.debug(
            //                 'Device has DFU trigger interface, probably in Application mode'
            //             );
            //             // TODO
            //             //     return getSemVersion(usbDevice, interfaceNumber).then(
            //             //         semver => {
            //             //             debug(`'${semver}'`);
            //             //             if (
            //             //                 Object.keys(dfu)
            //             //                     .map(key => dfu[key].semver)
            //             //                     .includes(semver)
            //             //             ) {
            //             //                 if (
            //             //                     needSerialport &&
            //             //                     !selectedDevice.serialport
            //             //                 ) {
            //             //                     return Promise.reject(
            //             //                         new Error('Missing serial port')
            //             //                     );
            //             //                 }
            //             //                 debug(
            //             //                     'Device is running the correct fw version'
            //             //                 );
            //             //                 return createReturnValue(
            //             //                     selectedDevice,
            //             //                     { wasProgrammed: false },
            //             //                     detailedOutput
            //             //                 );
            //             //             }
            //             //             debug('Device requires different firmware');
            //             //             return performDFU(selectedDevice, options);
            //             //         }
            //             //     );
            //             // }
            //             // debug(
            //             //     'Device is not in DFU-Bootloader and has no DFU trigger interface'
            //             // );
            //             return performDFU(device, deviceSetupConfig);
            //         }
            //     }
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
