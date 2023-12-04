/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import NrfutilDeviceLib from '../../nrfutil/device/device';
import { DeviceInfo } from '../../nrfutil/device/deviceInfo';
import { FWInfo } from '../../nrfutil/device/getFwInfo';
import logger from '../logging';
import type { AppThunk, RootState } from '../store';
import { DeviceSetup, JprogEntry } from './deviceSetup';
import { Device, setReadbackProtected } from './deviceSlice';

const getDeviceReadProtection = async (
    device: Device
): Promise<{
    fwInfo: FWInfo | null;
    readbackProtection: 'unknown' | 'protected' | 'unprotected';
}> => {
    try {
        logger.info('Checking readback protection on device');
        const info = await NrfutilDeviceLib.getFwInfo(device);
        return {
            fwInfo: info,
            readbackProtection: 'unprotected',
        };
    } catch (e) {
        const error = e as Error;
        if (error.message.includes('NotAvailableBecauseProtection')) {
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
    ): AppThunk<RootState, Promise<Device>> =>
    async (dispatch, getState) => {
        try {
            const batch = NrfutilDeviceLib.batch();
            if (getState().device.readbackProtection !== 'unprotected') {
                batch.recover('Application', {
                    onTaskBegin: () =>
                        logger.info(`Device protected, recovering device`),
                    onTaskEnd: () => logger.info(`Finished recovering device.`),
                    onException: () =>
                        logger.error(`Failed to recover device.`),
                    onProgress: progress => {
                        onProgress(
                            progress.totalProgressPercentage,
                            'Recovering device'
                        );
                    },
                });
            }

            batch.program(selectedFw.fw, 'Application', undefined, undefined, {
                onTaskBegin: () => logger.info(`Programming device`),
                onTaskEnd: () => logger.info(`Finished programming device.`),
                onException: () => logger.error(`Failed to program device.`),
                onProgress: progress => {
                    onProgress(
                        progress.totalProgressPercentage,
                        progress.message ?? 'programming'
                    );
                },
            });

            batch.reset('Application', undefined, {
                onTaskBegin: () => logger.info(`Resting device`),
                onTaskEnd: () => logger.info(`Finished resting device.`),
                onException: () => logger.error(`Failed to reset device.`),
                onProgress: progress => {
                    onProgress(
                        progress.totalProgressPercentage,
                        'Resetting device'
                    );
                },
            });

            await batch.run(device);
            await NrfutilDeviceLib.reset(device);
            onProgress(0, 'Updating readback protection');
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

const firmwareOptions = (
    device: Device,
    firmware: JprogEntry[],
    deviceInfo?: DeviceInfo
) =>
    firmware.filter(fw => {
        const family = (device.devkit?.deviceFamily || '').toLowerCase();
        const deviceType = (
            deviceInfo?.jlink?.deviceVersion || ''
        ).toLowerCase();
        const shortDeviceType = deviceType.split('_').shift();
        const boardVersion = (device.devkit?.boardVersion || '').toLowerCase();

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
    needSerialport = false,
    hideDeviceSetupWhenProtected = false
): DeviceSetup => ({
    supportsProgrammingMode: device =>
        (needSerialport === !!device.traits.serialPorts || !needSerialport) &&
        !!device.traits.jlink,
    getFirmwareOptions: (device, deviceInfo) =>
        firmwareOptions(device, firmware, deviceInfo).map(firmwareOption => ({
            key: firmwareOption.key,
            description: firmwareOption.description,
            programDevice: onProgress => dispatch =>
                dispatch(
                    programDeviceWithFw(device, firmwareOption, onProgress)
                ),
        })),
    isExpectedFirmware: (device, deviceInfo) => dispatch => {
        const fwVersions = firmwareOptions(device, firmware, deviceInfo);
        if (fwVersions.length === 0) {
            return Promise.resolve({
                device,
                validFirmware: false,
            });
        }

        return getDeviceReadProtection(device).then(
            ({ fwInfo: info, readbackProtection }) => {
                dispatch(setReadbackProtected(readbackProtection));
                if (info && info.imageInfoList.length > 0) {
                    const fw = fwVersions.find(version =>
                        info.imageInfoList.find(
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

                if (
                    hideDeviceSetupWhenProtected &&
                    readbackProtection === 'protected'
                ) {
                    return Promise.resolve({
                        device,
                        validFirmware: true,
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
