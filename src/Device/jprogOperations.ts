/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import logger from '../logging';
import { getFwInfo, program, recover, reset } from '../Nrfutil/device';
import { FWInfo } from '../Nrfutil/deviceTypes';
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
        const info = await getFwInfo(device);
        return {
            fwInfo: info,
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
    ): AppThunk<RootState, Promise<Device>> =>
    async (dispatch, getState) => {
        try {
            if (getState().device.readbackProtection === 'protected') {
                logger.info('Recovering device');
                onProgress(0, 'Recovering device');
                await recover(device, 'Application');
            }

            logger.debug(
                `Programming ${device.serialNumber} with ${selectedFw.fw}`
            );
            await program(
                device,
                selectedFw.fw,
                progress => {
                    onProgress(
                        progress.progressPercentage,
                        progress.message ?? 'programming'
                    );
                },
                'Application'
            );
            logger.debug(`Resetting ${device.serialNumber}`);
            onProgress(100, 'Resetting device');
            await reset(device);
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
            programDevice: onProgress => dispatch =>
                dispatch(
                    programDeviceWithFw(device, firmwareOption, onProgress)
                ),
        })),
    isExpectedFirmware: (device: Device) => dispatch => {
        const fwVersions = firmwareOptions(device, firmware);
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

                return Promise.resolve({
                    device,
                    validFirmware: false,
                });
            }
        );
    },
    tryToSwitchToApplicationMode: () => () => Promise.resolve(null),
});
