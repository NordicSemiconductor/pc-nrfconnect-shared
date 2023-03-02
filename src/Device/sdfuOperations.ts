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
import { setWaitForDevice } from './deviceAutoSelectSlice';
import { getDeviceLibContext } from './deviceLibWrapper';
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

const updateBootloader = async (
    device: Device,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    logger.info(`Update Bootloader ${device}`);
    const zip = new AdmZip(getAppFile(LATEST_BOOTLOADER));
    const zipBuffer = zip.toBuffer();

    logger.debug('Starting Bootloader Update');

    await nrfDeviceLib.firmwareProgram(
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
                onFail(err.message);
            } else {
                dispatch(
                    setWaitForDevice({
                        timeout: DEFAULT_DEVICE_WAIT_TIME,
                        when: 'always',
                        once: true,
                        onSuccess,
                        onFail,
                    })
                );

                logger.info('Bootloader has been written to the target device');
                logger.debug('Bootloader DFU completed successfully!');
            }
        },
        progressJson
    );
};

const switchToDeviceMode = (
    device: Device,
    mcuState: nrfDeviceLib.MCUState,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    nrfDeviceLib
        .deviceControlSetMcuState(getDeviceLibContext(), device.id, mcuState)
        .then(() => {
            dispatch(
                setWaitForDevice({
                    timeout: 10000,
                    when:
                        mcuState === 'NRFDL_MCU_STATE_APPLICATION'
                            ? 'applicationMode'
                            : 'BootLoaderMode',
                    once: true,
                    onSuccess,
                    onFail,
                })
            );
        })
        .catch(err => onFail(err));
};

export const switchToBootloaderMode = (
    device: Device,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    if (!isDeviceInDFUBootloader(device)) {
        switchToDeviceMode(
            device,
            'NRFDL_MCU_STATE_PROGRAMMING',
            dispatch,
            onSuccess,
            onFail
        );
    } else if (onSuccess) {
        onSuccess(device);
    }
};

export const switchToApplicationMode = (
    device: Device,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    switchToDeviceMode(
        device,
        'NRFDL_MCU_STATE_APPLICATION',
        dispatch,
        onSuccess,
        onFail
    );
};

const isLatestBootloader = async (device: Device) => {
    if (!isDeviceInDFUBootloader(device)) {
        throw new Error('Cannot read bootloader information.');
    }

    const bootloaderInfo = await getBootloaderInformation(device);

    if (
        !bootloaderInfo ||
        bootloaderInfo.bootloaderType !== 'NRFDL_BOOTLOADER_TYPE_SDFU' ||
        bootloaderInfo.version >= LATEST_BOOTLOADER_VERSION
    ) {
        return true;
    }

    return false;
};

const askAndUpdateBootloader = (
    device: Device,
    dispatch: TDispatch,
    promiseConfirm: PromiseConfirm,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    switchToBootloaderMode(
        device,
        dispatch,
        async d => {
            if (!(await isLatestBootloader(d))) {
                if (
                    !(await promiseConfirm(
                        'Device will be programmed. A Newer version of the bootloader is available, do you want to update it as well?'
                    ))
                ) {
                    logger.info('Continuing with old bootloader');
                    onSuccess(d);
                } else {
                    const action = (dd: Device) => {
                        switchToBootloaderMode(dd, dispatch, onSuccess, onFail);
                    };
                    updateBootloader(d, dispatch, action, onFail);
                }
            } else {
                onSuccess(d);
            }
        },
        onFail
    );
};

export const confirmHelper = async (promiseConfirm?: PromiseConfirm) => {
    if (!promiseConfirm) return true;
    try {
        return await promiseConfirm(
            'Device must be programmed, do you want to proceed?'
        );
    } catch (err) {
        throw new Error('Preparation cancelled by user');
    }
};

export const choiceHelper = (
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

const programInDFUBootloader = async (
    device: Device,
    dfu: DfuEntry,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
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
                onFail(err.message);
            } else {
                logger.info(
                    'All dfu images have been written to the target device'
                );
                logger.debug('DFU completed successfully!');
                dispatch(
                    setWaitForDevice({
                        timeout: DEFAULT_DEVICE_WAIT_TIME,
                        when: 'applicationMode',
                        once: true,
                        onSuccess,
                        onFail,
                    })
                );
            }
        },
        progressJson
    );
};

export const performDFU = (
    selectedDevice: Device,
    options: DeviceSetup,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    const { dfu, promiseConfirm, promiseChoice } = options;

    if (dfu == null) {
        logger.error('Must never be called without DFU options.');
        throw new Error('Must never be called without DFU options.');
    }

    const action = async (d: Device) => {
        const choice = await choiceHelper(Object.keys(dfu), promiseChoice);
        programInDFUBootloader(d, dfu[choice], dispatch, onSuccess, onFail);
        logger.debug('DFU finished: ', d);
    };

    if (promiseConfirm) {
        askAndUpdateBootloader(
            selectedDevice,
            dispatch,
            promiseConfirm,
            action,
            onFail
        );
    } else {
        action(selectedDevice);
    }
};

export default {
    createDfuZipBuffer,
};
