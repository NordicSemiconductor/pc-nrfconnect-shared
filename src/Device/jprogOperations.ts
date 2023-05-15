/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib, {
    deviceControlReset,
    Error as nrfError,
    firmwareProgram,
    FirmwareStreamType,
    readFwInfo,
} from '@nordicsemiconductor/nrf-device-lib-js';

import logger from '../logging';
import { Device, RootState, TDispatch } from '../state';
import { getDeviceLibContext } from './deviceLibWrapper';
import type { DeviceSetup, IDeviceSetup, JprogEntry } from './deviceSetup';
import {
    selectedDevice,
    setDeviceSetupProgress,
    setDeviceSetupProgressMessage,
    setReadbackProtected,
} from './deviceSlice';

const deviceLibContext = getDeviceLibContext();

let lastMSG = '';
const progressJson =
    ({ progressJson: progress }: nrfDeviceLib.Progress.CallbackParameters) =>
    (dispatch: TDispatch) => {
        const message = progress.message || '';

        const status = `${message.replace('.', ':')} ${
            progress.progressPercentage
        }%`;

        if (status !== lastMSG) {
            dispatch(setDeviceSetupProgress(progress.progressPercentage));
            dispatch(setDeviceSetupProgressMessage(status));
            logger.info(status);
            lastMSG = status;
        }
    };

const program = (
    deviceId: number,
    firmware: string | Buffer,
    dispatch: TDispatch
) => {
    let fwFormat: FirmwareStreamType;
    if (firmware instanceof Buffer) {
        fwFormat = 'NRFDL_FW_BUFFER';
    } else {
        fwFormat = 'NRFDL_FW_FILE';
    }
    return new Promise<void>((resolve, reject) => {
        dispatch(setDeviceSetupProgress(0));
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
            progress => dispatch(progressJson(progress)),
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

export const updateHasReadbackProtection =
    () => async (dispatch: TDispatch, getState: () => RootState) => {
        const device = selectedDevice(getState());

        if (!device || !device.traits.jlink) {
            dispatch(setReadbackProtected('unknown'));
            return 'unknown';
        }

        try {
            await readFwInfo(deviceLibContext, device.id);
        } catch (error) {
            // @ts-expect-error Wrongly typed in device lib at the moment
            if (error.error_code === 24) {
                dispatch(setReadbackProtected('protected'));
                return 'protected';
            }
        }
        dispatch(setReadbackProtected('unprotected'));
        return 'unprotected';
    };

export const jProgDeviceSetup = (firmware: JprogEntry[]): IDeviceSetup => {
    const firmwareOptions = (device: Device) =>
        firmware.filter(fw => {
            const family = (device.jlink?.deviceFamily || '').toLowerCase();
            const deviceType = (
                device.jlink?.deviceVersion || ''
            ).toLowerCase();
            const shortDeviceType = deviceType.split('_').shift();
            const boardVersion = (
                device.jlink?.boardVersion || ''
            ).toLowerCase();

            const key = fw.key.toLowerCase();
            return (
                key === deviceType ||
                key === shortDeviceType ||
                key === boardVersion ||
                key === family
            );
        });

    const programDeviceWithFw = async (
        device: Device,
        selectedFw: JprogEntry,
        dispatch: TDispatch
    ) => {
        try {
            logger.debug(
                `Programming ${device.serialNumber} with ${selectedFw.fw}`
            );
            await program(device.id, selectedFw.fw, dispatch);
            logger.debug(`Resetting ${device.serialNumber}`);
            await reset(device.id);
        } catch (programError) {
            if (programError instanceof Error) {
                logger.error(programError);
                throw new Error(
                    `Error when programming ${programError.message}`
                );
            }
        }
        return device;
    };
    return {
        supportsProgrammingMode: (device: Device) =>
            device.traits.jlink === true,
        getFirmwareOptions: device =>
            firmwareOptions(device).map(firmwareOption => ({
                key: firmwareOption.key,
                programDevice: () => (dispatch: TDispatch) =>
                    programDeviceWithFw(device, firmwareOption, dispatch),
            })),
        isExpectedFirmware: (device: Device) => async (dispatch: TDispatch) => {
            const fwVersions = firmwareOptions(device);
            if (fwVersions.length === 0) {
                return Promise.resolve({
                    device,
                    validFirmware: false,
                });
            }

            try {
                const fwInfo = await readFwInfo(deviceLibContext, device.id);
                dispatch(setReadbackProtected('unprotected'));

                if (fwInfo.imageInfoList.length > 0) {
                    const fw = fwVersions.find(version =>
                        fwInfo.imageInfoList.find(
                            imageInfo =>
                                typeof imageInfo.version === 'string' &&
                                imageInfo.version.includes(version.key)
                        )
                    );

                    return Promise.resolve({
                        device,
                        validFirmware: fw !== undefined,
                    });
                }
            } catch (error) {
                // @ts-expect-error Wrongly typed in device lib at the moment
                if (error.error_code === 24) {
                    logger.warn(
                        'Readback protection on device enabled. Unable to verify that the firmware version is correct.'
                    );
                    dispatch(setReadbackProtected('protected'));
                    return Promise.reject(new Error('protected'));
                }
                dispatch(setReadbackProtected('unknown'));
                return Promise.resolve({
                    device,
                    validFirmware: false,
                });
            }

            return Promise.resolve({
                device,
                validFirmware: false,
            });
        },
        tryToSwitchToApplicationMode: () => () => Promise.resolve(null),
    };
};

/**
 * Helper function that calls optional user defined confirmation e.g. dialog or inquirer.
 *
 * @param {function} promiseConfirm Promise returning function
 * @returns {Promise} resolves to boolean
 */
const confirmHelper = async (
    promiseConfirm?: (message: string) => Promise<boolean>
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

export async function programFirmware(
    device: Device,
    fw: string | Buffer,
    deviceSetupConfig: DeviceSetup,
    dispatch: TDispatch
) {
    try {
        const confirmed = await confirmHelper(deviceSetupConfig.promiseConfirm);
        if (!confirmed) return device;

        logger.debug(`Programming ${device.serialNumber} with ${fw}`);
        await program(device.id, fw, dispatch);
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
