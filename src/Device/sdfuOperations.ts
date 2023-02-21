/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js';
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import fs from 'fs';
import MemoryMap from 'nrf-intel-hex';

import logger from '../logging';
import { Device, TDispatch } from '../state';
import { getDeviceLibContext } from './deviceLibWrapper';
import { waitForAutoReconnect } from './deviceLister';
import type { DeviceSetup, DfuEntry } from './deviceSetup';
import {
    createInitPacketBuffer,
    defaultInitPacket,
    DfuImage,
    FwType,
    HashType,
    InitPacket,
} from './initPacket';

export type PromiseConfirm = (message: string) => Promise<boolean>;
export type PromiseChoice = (
    question: string,
    choices: string[]
) => Promise<string>;

const NORDIC_DFU_PRODUCT_ID = 0x521f;
const NORDIC_VENDOR_ID = 0x1915;
const DEFAULT_DEVICE_WAIT_TIME = 10000;

export const isDeviceInDFUBootloader = (device: Device) => {
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
        return vendorId === '1915' && productId?.toUpperCase() === '521F';
    }
    return false;
};

/**
 * Trigger DFU Bootloader mode if the device is not yet in that mode.
 *
 * @param {Object} device device
 * @returns {Promise<Object>} device object which is already in bootloader.
 */
export const ensureBootloaderMode = /* async */ (device: Device) => {
    if (isDeviceInDFUBootloader(device)) {
        logger.debug('Device is in bootloader mode');
        return device;
    }
    return device;

    // TODO
    // let usbdev = device.usb;
    // let retry = 0;
    // while (!usbdev && retry < 3) {gt
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
const checkConfirmUpdateBootloader = /* async */ (
    device: Device,
    promiseConfirm?: PromiseConfirm
) => {
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
const confirmHelper = async (promiseConfirm?: PromiseConfirm) => {
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
const choiceHelper = /* async */ (
    choices: string[],
    promiseChoice?: PromiseChoice
) => {
    if (choices.length > 1 && promiseChoice) {
        return promiseChoice('Which firmware do you want to program?', choices);
    }
    return choices.slice(-1)[0];
};

/**
 * Loads firmware image from HEX file
 *
 * @param {Buffer|string} firmware contents of HEX file if Buffer otherwise path of HEX file
 * @returns {Uint8Array} the loaded firmware
 */
function parseFirmwareImage(firmware: Buffer | string) {
    const contents =
        firmware instanceof Buffer ? firmware : fs.readFileSync(firmware);

    const memMap = MemoryMap.fromHex(contents.toString());
    let startAddress = 0;
    let endAddress = 0;
    memMap.forEach((block, address) => {
        startAddress = !startAddress ? address : startAddress;
        endAddress = address + block.length;
    });
    return memMap.slicePad(
        startAddress,
        Math.ceil((endAddress - startAddress) / 4) * 4
    ) as Buffer;
}

/**
 * Calculates SHA256 hash of image
 *
 * @param {Uint8Array} image to calculate hash from
 * @returns {Buffer} SHA256 hash
 */
function calculateSHA256Hash(image: Uint8Array) {
    const digest = createHash('sha256');
    digest.update(image);
    return Buffer.from(digest.digest().reverse());
}

interface DfuData {
    application?: { bin: Buffer; dat: Buffer };
    softdevice?: { bin: Uint8Array; dat: Uint8Array };
    params?: InitPacket;
}

/**
 * Create DFU data from prepared DFU images
 *
 * @param {Array} dfuImages to be created
 * @returns {Object} DFU data
 */
const createDfuDataFromImages = (dfuImages: DfuImage[]): DfuData => {
    const extract = (image: DfuImage) => ({
        bin: image.firmwareImage,
        dat: createInitPacketBuffer(
            image.initPacket.fwVersion as number,
            image.initPacket.hwVersion as number,
            image.initPacket.sdReq as number[],
            image.initPacket.fwType as number,
            image.initPacket.sdSize,
            image.initPacket.blSize,
            image.initPacket.appSize,
            image.initPacket.hashType,
            image.initPacket.hash as Buffer,
            image.initPacket.isDebug,
            image.initPacket.signatureType as number,
            image.initPacket.signature as []
        ),
    });

    const application = dfuImages.find(i => i.name === 'Application');
    const softdevice = dfuImages.find(i => i.name === 'SoftDevice');

    return {
        application: application && extract(application),
        softdevice: softdevice && extract(softdevice),
    };
};

interface Manifest {
    application?: { bin_file: string; dat_file: string };
    softdevice?: { bin_file: string; dat_file: string };
}

/**
 * Create DFU zip from prepared DFU images
 *
 * @param {Array} dfuImages to be created
 * @returns {Object} zip
 */
const createDfuZip = (dfuImages: DfuImage[]) =>
    new Promise<AdmZip>(resolve => {
        const data = createDfuDataFromImages(dfuImages);
        const zip = new AdmZip();
        const manifest: Manifest = {};

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
            zip.addFile('softdevice.bin', data.softdevice.bin as Buffer);
            zip.addFile('softdevice.dat', data.softdevice.dat as Buffer);
        }

        const manifestJson = JSON.stringify({ manifest });
        const manifestBuffer = Buffer.alloc(manifestJson.length, manifestJson);
        zip.addFile('manifest.json', manifestBuffer);

        resolve(zip);
    });

/**
 * Create DFU zip buffer from prepared DFU images
 *
 * @param {Array} dfuImages to be created
 * @returns {Buffer} buffer
 */
const createDfuZipBuffer = async (dfuImages: DfuImage[]) => {
    const zip = await createDfuZip(dfuImages);
    const buffer = zip.toBuffer();
    return buffer;
};

const prepareInDFUBootloader = async (
    device: Device,
    dfu: DfuEntry,
    dispatch: TDispatch
): Promise<Device> => {
    logger.debug(
        `${device.serialNumber} on ${device.serialport?.comName} is now in DFU-Bootloader...`
    );
    const { application, softdevice } = dfu;
    const params: Partial<InitPacket> = dfu.params || {};

    const dfuImages: DfuImage[] = [];
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

        const packet: InitPacket = {
            ...defaultInitPacket,
            ...initPacketParams,
        };
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
        // @ts-expect-error This parameter is set.
        sdReq: params.sdId || [],
    };

    const packet = { ...defaultInitPacket, ...initPacketParams };
    dfuImages.push({ name: 'Application', initPacket: packet, firmwareImage });

    const zipBuffer = await createDfuZipBuffer(dfuImages);

    let prevPercentage: number;

    logger.debug('Starting DFU');
    await new Promise<void>(resolve => {
        nrfDeviceLib.firmwareProgram(
            getDeviceLibContext(),
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
                if (prevPercentage !== progress.progressPercentage) {
                    const message = progress.message || '';

                    const status = `${message.replace('.', ':')} ${
                        progress.progressPercentage
                    }%`;

                    logger.info(status);
                    prevPercentage = progress.progressPercentage;
                }
            }
        );
    });

    return waitForAutoReconnect(dispatch, {
        timeout: DEFAULT_DEVICE_WAIT_TIME,
        when: 'applicationMode',
    });
};

export const performDFU = async (
    selectedDevice: Device,
    options: DeviceSetup,
    dispatch: TDispatch
): Promise<Device> => {
    const { dfu, promiseConfirm, promiseChoice } = options;
    const isConfirmed = await confirmHelper(promiseConfirm);

    if (!isConfirmed) {
        // go on without DFU
        return selectedDevice;
    }

    if (dfu == null) {
        logger.error('Must never be called without DFU options.');
        return selectedDevice;
    }

    const choice = await choiceHelper(Object.keys(dfu), promiseChoice);

    try {
        let device = await ensureBootloaderMode(selectedDevice);
        device = await checkConfirmUpdateBootloader(device, promiseConfirm);
        device = await ensureBootloaderMode(device);
        device = await prepareInDFUBootloader(device, dfu[choice], dispatch);

        logger.debug('DFU finished: ', device);
        return device;
    } catch (err) {
        logger.debug('DFU failed: ', err);
        throw err;
    }
};

export default {
    createDfuZipBuffer,
};
