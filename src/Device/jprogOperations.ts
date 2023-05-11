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
    FWInfo,
    readFwInfo,
} from '@nordicsemiconductor/nrf-device-lib-js';

import logger from '../logging';
import { Device, RootState, TDispatch } from '../state';
import { getDeviceLibContext } from './deviceLibWrapper';
import type { DeviceSetup } from './deviceSetup';
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
        // @ts-expect-error Wrongly typed in device lib at the moment
        if (error.error_code === 24) {
            logger.warn(
                'Readback protection on device enabled. Unable to verify that the firmware version is correct.'
            );
            return 'READBACK_PROTECTION_ENABLED';
        }
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
