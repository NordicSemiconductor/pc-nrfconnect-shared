/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import NrfutilDeviceLib from '../../nrfutil/device/device';
import { DeviceInfo } from '../../nrfutil/device/deviceInfo';
import { updateOBFirmwareWithWaitForDevice } from '../../nrfutil/device/updateDebugProbeFirmware';
import logger from '../logging';
import type { AppThunk, RootState } from '../store';
import { DeviceSetup, JprogEntry } from './deviceSetup';
import {
    Device,
    getReadbackProtection,
    setSelectedDeviceInfo,
} from './deviceSlice';

const programDeviceWithFw =
    (
        device: Device,
        selectedFw: JprogEntry,
        updateOBFw: boolean,
        onProgress: (progress: number, message?: string) => void
    ): AppThunk<RootState, Promise<Device>> =>
    async (dispatch, getState) => {
        try {
            const batch = NrfutilDeviceLib.batch();

            if (updateOBFw) {
                await dispatch(updateOBFirmwareWithWaitForDevice(device));
            }

            if (
                getReadbackProtection(getState()) !==
                'NRFDL_PROTECTION_STATUS_NONE'
            ) {
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
            const deviceInfo = await NrfutilDeviceLib.deviceInfo(device);
            dispatch(setSelectedDeviceInfo(deviceInfo));
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
    updateOBFw: boolean,
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
                    programDeviceWithFw(
                        device,
                        firmwareOption,
                        updateOBFw,
                        onProgress
                    )
                ),
        })),
    isExpectedFirmware: (device, deviceInfo) => async (_, getState) => {
        const fwVersions = firmwareOptions(device, firmware, deviceInfo);
        if (fwVersions.length === 0) {
            return Promise.resolve({
                device,
                validFirmware: false,
            });
        }

        if (
            getReadbackProtection(getState()) !== 'NRFDL_PROTECTION_STATUS_NONE'
        ) {
            logger.warn(
                'Readback protection on device enabled. Unable to verify that the firmware version is correct.'
            );

            return Promise.resolve({
                device,
                validFirmware: hideDeviceSetupWhenProtected,
            });
        }

        try {
            const info = await NrfutilDeviceLib.getFwInfo(device);
            if (info.imageInfoList.length > 0) {
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
        } catch {
            // do nothing
        }

        return Promise.resolve({
            device,
            validFirmware: false,
        });
    },
    tryToSwitchToApplicationMode: () => () => Promise.resolve(null),
});
