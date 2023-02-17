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
import { getAppFile } from '../utils/appDirs';
import { getDeviceLibContext } from './deviceLibWrapper';
import type { DeviceSetup, DfuEntry } from './deviceSetup';
import { setForceAutoReconnect } from './deviceSlice';
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

let lastMSG = '';
const progressJson = ({
    progressJson: progress,
}: nrfDeviceLib.Progress.CallbackParameters) => {
    const message = progress.message || '';

    const status = `${message.replace('.', ':')} ${
        progress.progressPercentage
    }%`;

    if (status !== lastMSG) logger.info(status);
    lastMSG = status;
};

const NORDIC_DFU_PRODUCT_ID = 0x521f;
const NORDIC_VENDOR_ID = 0x1915;
const DEFAULT_DEVICE_WAIT_TIME = 10000;

const LATEST_BOOTLOADER =
    'fw/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip';
const LATEST_BOOTLOADER_VERSION = 3; // check with nrfutil pkg display ...

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

export const ensureBootloaderMode = (device: Device) => {
    if (isDeviceInDFUBootloader(device)) {
        logger.debug('Device is in bootloader mode');
        return true;
    }
    logger.debug('Device is NOT in bootloader mode');
    return false;
};

const getBootloaderInformation = async (device: Device) => {
    const info = await nrfDeviceLib.readFwInfo(
        getDeviceLibContext(),
        device.id
    );

    const index = info.imageInfoList.findIndex(
        imageInfo => imageInfo.imageType === 'NRFDL_IMAGE_TYPE_BOOTLOADER'
    );
    if (index !== -1) {
        return {
            bootloaderType: info.bootloaderType,
            version: info.imageInfoList[index].version,
        };
    }

    return null;
};

const updateBootloader = (device: Device, dispatch: TDispatch) => {
    logger.info(`Update Bootloader ${device}`);
    const zip = new AdmZip(getAppFile(LATEST_BOOTLOADER));
    const zipBuffer = zip.toBuffer();

    dispatch(
        setForceAutoReconnect({
            timeout: DEFAULT_DEVICE_WAIT_TIME,
            when: 'BootLoaderMode',
            once: true,
        })
    );

    logger.debug('Starting Bootloader Update');
    return new Promise<void>((resolve, reject) => {
        nrfDeviceLib.firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_BUFFER',
            'NRFDL_FW_SDFU_ZIP',
            zipBuffer,
            err => {
                if (err) {
                    logger.error(
                        `Failed to write bootloader to the target device: ${
                            err.message || err
                        }`
                    );
                    reject(err.message);
                } else {
                    logger.info(
                        'Bootloader has been written to the target device'
                    );
                    logger.debug('Bootloader DFU completed successfully!');
                    resolve();
                }
            },
            progressJson
        );
    });
};

const checkConfirmUpdateBootloader = async (
    device: Device,
    dispatch: TDispatch,
    promiseConfirm?: PromiseConfirm
) => {
    if (!promiseConfirm) {
        // without explicit consent bootloader will not be updated
        return true;
    }

    if (!isDeviceInDFUBootloader(device)) {
        dispatch(
            setForceAutoReconnect({
                timeout: 3000,
                when: 'BootLoaderMode',
                once: true,
            })
        );
    }

    const bootloaderInfo = await getBootloaderInformation(device);
    if (
        !bootloaderInfo ||
        bootloaderInfo.bootloaderType !== 'NRFDL_BOOTLOADER_TYPE_SDFU' ||
        bootloaderInfo.version >= LATEST_BOOTLOADER_VERSION
    ) {
        return true;
    }

    if (
        !(await promiseConfirm(
            'Newer version of the bootloader is available, do you want to update it?'
        ))
    ) {
        logger.info('Continuing with old bootloader');
        return true;
    }

    await updateBootloader(device, dispatch);
    return false; // device will not be ready as it will reboot
};

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

const createDfuZipBuffer = async (dfuImages: DfuImage[]) => {
    const zip = await createDfuZip(dfuImages);
    const buffer = zip.toBuffer();
    return buffer;
};

const prepareInDFUBootloader = async (
    device: Device,
    dfu: DfuEntry,
    dispatch: TDispatch
): Promise<void> => {
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

    logger.debug('Starting DFU');

    dispatch(
        setForceAutoReconnect({
            timeout: DEFAULT_DEVICE_WAIT_TIME,
            when: 'always',
            once: false,
        })
    );

    return new Promise<void>((resolve, reject) => {
        nrfDeviceLib.firmwareProgram(
            getDeviceLibContext(),
            device.id,
            'NRFDL_FW_BUFFER',
            'NRFDL_FW_SDFU_ZIP',
            zipBuffer,
            err => {
                dispatch(
                    setForceAutoReconnect({
                        timeout: DEFAULT_DEVICE_WAIT_TIME,
                        when: 'applicationMode',
                        once: true,
                    })
                );
                if (err) {
                    logger.error(
                        `Failed to write to the target device: ${
                            err.message || err
                        }`
                    );
                    reject(err.message);
                } else {
                    logger.info(
                        'All dfu images have been written to the target device'
                    );
                    logger.debug('DFU completed successfully!');
                    resolve();
                }
            },
            progressJson
        );
    });
};

export const performDFU = async (
    selectedDevice: Device,
    options: DeviceSetup,
    dispatch: TDispatch,
    autoReconnected: boolean
): Promise<void> => {
    const { dfu, promiseConfirm, promiseChoice } = options;

    if (dfu == null) {
        logger.error('Must never be called without DFU options.');
        throw new Error('Must never be called without DFU options.');
    }

    if (!autoReconnected) {
        const isConfirmed = await confirmHelper(promiseConfirm);
        if (!isConfirmed) {
            throw new Error('Device is in bootloader mode. We cannot use it.');
        }
    }

    try {
        if (
            !(await checkConfirmUpdateBootloader(
                selectedDevice,
                dispatch,
                promiseConfirm
            ))
        )
            return;

        const choice = await choiceHelper(Object.keys(dfu), promiseChoice);
        await prepareInDFUBootloader(selectedDevice, dfu[choice], dispatch);
        logger.debug('DFU finished: ', selectedDevice);
        return; // Device is not ready we have just programmed it will reboot;
    } catch (err) {
        logger.debug('DFU failed: ', err);
        throw err;
    }
};

export default {
    createDfuZipBuffer,
};
