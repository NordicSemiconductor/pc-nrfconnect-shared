/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js';
import AdmZip from 'adm-zip';
import fs from 'fs';
import * as dfu from 'nrf-fw-update-bundle-lib';

import logger from '../logging';
import { Device, TDispatch } from '../state';
import { getAppFile } from '../utils/appDirs';
import { setWaitForDevice } from './deviceAutoSelectSlice';
import { getDeviceLibContext } from './deviceLibWrapper';
import type { DeviceSetup, DfuEntry } from './deviceSetup';
import { DfuImage, FwType, InitPacket } from './initPacket';

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
            d => {
                if (!isDeviceInDFUBootloader(d))
                    onFail(new Error('Failed to switch To Bootloader Mode'));
                else onSuccess(d);
            },
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
        d => {
            if (isDeviceInDFUBootloader(d))
                onFail(new Error('Failed to switch to Application Mode'));
            else onSuccess(d);
        },
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

const createDfuZipBufferFromImages = (dfuImages: DfuImage[]) => {
    const applicationDfuImage = dfuImages.find(
        dfuImage => dfuImage.initPacket.fwType === FwType.APPLICATION
    );
    const softDeviceDfuImage = dfuImages.find(
        dfuImage => dfuImage.initPacket.fwType === FwType.SOFTDEVICE
    );
    const bootloaderDfuImage = dfuImages.find(
        dfuImage => dfuImage.initPacket.fwType === FwType.BOOTLOADER
    );

    const applicationSpec = applicationDfuImage
        ? dfu.ApplicationSpec.copyFromBuffer({
              name: applicationDfuImage.name,
              version: applicationDfuImage.initPacket.fwVersion || 4,
              buffer: applicationDfuImage.firmwareImage,
          })
        : undefined;

    const bootloaderSpec = bootloaderDfuImage
        ? dfu.BootloaderSpec.copyFromBuffer({
              name: bootloaderDfuImage.name,
              buffer: bootloaderDfuImage.firmwareImage,
              version: bootloaderDfuImage.initPacket.fwVersion || 4,
          })
        : undefined;

    const softDeviceSpec = softDeviceDfuImage
        ? dfu.SoftDeviceSpec.copyFromBuffer({
              name: softDeviceDfuImage.name,
              buffer: softDeviceDfuImage.firmwareImage,
          })
        : undefined;

    let hwVersion = applicationDfuImage
        ? applicationDfuImage.initPacket.hwVersion
        : undefined;
    hwVersion =
        hwVersion ??
        (bootloaderDfuImage
            ? bootloaderDfuImage.initPacket.hwVersion
            : undefined);
    hwVersion =
        hwVersion ??
        (softDeviceDfuImage
            ? softDeviceDfuImage.initPacket.hwVersion
            : undefined);

    const input = dfu.input({
        applicationSpec,
        softDeviceSpec,
        bootloaderSpec,
        // @ts-expect-error This parameter is set.
        sdId: applicationDfuImage?.initPacket.sdId,
        sdReq: unique(
            (applicationDfuImage?.initPacket.sdReq ?? []).concat(
                bootloaderDfuImage?.initPacket.sdReq ?? [],
                softDeviceDfuImage?.initPacket.sdReq ?? []
            )
        ),
    });

    if (hwVersion === undefined) {
        throw Error('Unable to extract hwVersion from DFU image array');
    }

    return dfu.generate(hwVersion, input);
};

const unique = (entries: number[]) => Array.from(new Set(entries));

const createDfuZipBuffer = (
    params: Partial<InitPacket>,
    application: string,
    softDevice?: string | Buffer
) => {
    const hwVersion = params.hwVersion || 52;

    const appHex = fs.readFileSync(application);
    const appBinary = dfu.intelHexToBuffer(appHex);
    const applicationSpec = dfu.ApplicationSpec.copyFromBuffer({
        name: 'Application',
        version: params.fwVersion || 4,
        buffer: appBinary,
    });

    let softDeviceSpec;
    if (softDevice) {
        // If we have a softdevice then include that too and create a joint application_softDevice input
        const softDeviceHexBuffer =
            softDevice instanceof Buffer
                ? softDevice
                : fs.readFileSync(softDevice);
        const softDeviceBinary = dfu.intelHexToBuffer(softDeviceHexBuffer);
        softDeviceSpec = dfu.SoftDeviceSpec.copyFromBuffer({
            name: 'SoftDevice',
            buffer: softDeviceBinary,
        });
    }

    const input = dfu.input({
        applicationSpec,
        softDeviceSpec,
        // @ts-expect-error This parameter is set.
        sdId: params.sdId || [],
        sdReq: params.sdReq || [],
    });

    return dfu.generate(hwVersion, input);
};

const programInDFUBootloader = async (
    device: Device,
    dfuEntry: DfuEntry,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    logger.debug(
        `${device.serialNumber} on ${device.serialport?.comName} is now in DFU-Bootloader...`
    );
    const { application, softdevice } = dfuEntry;
    const params: Partial<InitPacket> = dfuEntry.params || {};

    const zipBuffer = await createDfuZipBuffer(params, application, softdevice);

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
                onFail(err);
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
    const { dfu: dfuLookup, promiseConfirm, promiseChoice } = options;

    if (dfuLookup == null) {
        logger.error('Must never be called without DFU options.');
        throw new Error('Must never be called without DFU options.');
    }

    const action = async (d: Device) => {
        const choice = await choiceHelper(Object.keys(dfu), promiseChoice);
        programInDFUBootloader(
            d,
            dfuLookup[choice],
            dispatch,
            onSuccess,
            onFail
        );
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
    createDfuZipBufferFromImages,
};
