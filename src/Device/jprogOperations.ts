/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib, {
    deviceControlRecover,
    deviceControlReset,
    Error as nrfError,
    firmwareProgram,
    FirmwareStreamType,
    readFwInfo,
} from '@nordicsemiconductor/nrf-device-lib-js';

import logger from '../logging';
import { Device, RootState, TDispatch } from '../state';
import { getDeviceLibContext } from './deviceLibWrapper';
import { DeviceSetup, JprogEntry } from './deviceSetup';
import { setReadbackProtected } from './deviceSlice';

const program = (
    deviceId: number,
    firmware: string | Buffer,
    onProgress: (progress: number, message?: string) => void
) => {
    let fwFormat: FirmwareStreamType;
    if (firmware instanceof Buffer) {
        fwFormat = 'NRFDL_FW_BUFFER';
    } else {
        fwFormat = 'NRFDL_FW_FILE';
    }
    return new Promise<void>((resolve, reject) => {
        onProgress(0, 'Preparing to program');
        firmwareProgram(
            getDeviceLibContext(),
            deviceId,
            fwFormat,
            'NRFDL_FW_INTEL_HEX',
            firmware,
            (error?: nrfError) => {
                if (error) reject(error);
                logger.info('Device programming completed.');
                resolve();
            },
            progress => {
                onProgress(
                    progress.progressJson.progressPercentage,
                    progress.progressJson.message ?? 'programming'
                );
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
const reset = async (deviceId: number) => {
    await deviceControlReset(getDeviceLibContext(), deviceId);
};

const getDeviceReadProtection = async (
    device: Device
): Promise<{
    fwInfo: nrfDeviceLib.FWInfo.ReadResult | null;
    readbackProtection: 'unknown' | 'protected' | 'unprotected';
}> => {
    try {
        const fwInfo = await readFwInfo(getDeviceLibContext(), device.id);
        return {
            fwInfo,
            readbackProtection: 'unprotected',
        };
    } catch (error) {
        // @ts-expect-error Wrongly typed in device lib at the moment
        if (error.error_code === 24) {
            logger.warn(
                'Readback protection on device enabled. Unable to verify that the firmware version is correct.'
            );
            return {
                fwInfo: null,
                readbackProtection: 'protected',
            };
        }
        return {
            fwInfo: null,
            readbackProtection: 'unknown',
        };
    }
};

const programDeviceWithFw =
    (
        device: Device,
        selectedFw: JprogEntry,
        onProgress: (progress: number, message?: string) => void
    ) =>
    async (dispatch: TDispatch, getState: () => RootState) => {
        try {
            if (getState().device.readbackProtection === 'protected') {
                logger.info('Recovering device');
                onProgress(0, 'Recovering device');
                await deviceControlRecover(
                    getDeviceLibContext(),
                    device.id,
                    'NRFDL_DEVICE_CORE_APPLICATION'
                );
            }

            logger.debug(
                `Programming ${device.serialNumber} with ${selectedFw.fw}`
            );
            await program(device.id, selectedFw.fw, onProgress);
            logger.debug(`Resetting ${device.serialNumber}`);
            onProgress(100, 'Resetting device');
            await reset(device.id);
            const { readbackProtection } = await getDeviceReadProtection(
                device
            );
            dispatch(setReadbackProtected(readbackProtection));
            onProgress(0, 'Connecting to device');
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

const firmwareOptions = (device: Device, firmware: JprogEntry[]) =>
    firmware.filter(fw => {
        const family = (device.jlink?.deviceFamily || '').toLowerCase();
        const deviceType = (device.jlink?.deviceVersion || '').toLowerCase();
        const shortDeviceType = deviceType.split('_').shift();
        const boardVersion = (device.jlink?.boardVersion || '').toLowerCase();

        const key = fw.key.toLowerCase();
        return (
            key === deviceType ||
            key === shortDeviceType ||
            key === boardVersion ||
            key === family
        );
    });

export const jprogDeviceSetup = (
    firmware: JprogEntry[],
    needSerialport = false
): DeviceSetup => ({
    supportsProgrammingMode: (device: Device) =>
        (needSerialport === !!device.traits.serialPorts || !needSerialport) &&
        !!device.traits.jlink,
    getFirmwareOptions: device =>
        firmwareOptions(device, firmware).map(firmwareOption => ({
            key: firmwareOption.key,
            description: firmwareOption.description,
            programDevice: onProgress => (dispatch: TDispatch) =>
                dispatch(
                    programDeviceWithFw(device, firmwareOption, onProgress)
                ),
        })),
    isExpectedFirmware: (device: Device) => (dispatch: TDispatch) => {
        const fwVersions = firmwareOptions(device, firmware);
        if (fwVersions.length === 0) {
            return Promise.resolve({
                device,
                validFirmware: false,
            });
        }

        return getDeviceReadProtection(device).then(
            ({ fwInfo, readbackProtection }) => {
                dispatch(setReadbackProtected(readbackProtection));
                if (fwInfo && fwInfo.imageInfoList.length > 0) {
                    const fw = fwVersions.find(version =>
                        fwInfo.imageInfoList.find(
                            imageInfo =>
                                typeof imageInfo.version === 'string' &&
                                imageInfo.version.includes(version.fwVersion)
                        )
                    );

                    return Promise.resolve({
                        device,
                        validFirmware: fw !== undefined,
                    });
                }

                return Promise.resolve({
                    device,
                    validFirmware: false,
                });
            }
        );
    },
    tryToSwitchToApplicationMode: () => () => Promise.resolve(null),
});
