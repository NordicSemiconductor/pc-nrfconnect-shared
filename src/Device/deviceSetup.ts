/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import logger from '../logging';
import describeError from '../logging/describeError';
import { Device, RootState, TDispatch } from '../state';
import {
    closeDeviceSetupDialog,
    openDeviceSetupDialog,
    setDeviceSetupProgress,
    setDeviceSetupProgressMessage,
} from './deviceSetupSlice';
import { InitPacket } from './initPacket';

export interface DfuEntry {
    key: string;
    description?: string;
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}

export interface JprogEntry {
    key: string;
    description?: string;
    fw: string;
    fwIdAddress: number;
    fwVersion: string;
}

export interface DeviceSetup {
    supportsProgrammingMode: (device: Device) => boolean; // Return true if this device can be programed using this interface e.g. MCU Boot or DFU
    getFirmwareOptions: (device: Device) => {
        key: string;
        description?: string;
        programDevice: (
            onProgress: (progress: number, message?: string) => void
        ) => (
            dispatch: TDispatch,
            getState: () => RootState
        ) => Promise<Device>;
    }[]; // The list of all firmware that can be applied for this device with the program function for that fw item
    isExpectedFirmware: (device: Device) => (
        dispatch: TDispatch,
        getState: () => RootState
    ) => Promise<{
        device: Device;
        validFirmware: boolean;
    }>; // returns true if device has one of the expected firmware returned by getFirmwareOptions
    tryToSwitchToApplicationMode: (
        device: Device
    ) => (
        dispatch: TDispatch,
        getState: () => RootState
    ) => Promise<Device | null>; // returns the device after switched to app mode. If this is not possible or not relevant return null
}

export interface DeviceSetupConfig {
    deviceSetups: DeviceSetup[];
    allowCustomDevice?: boolean;
    confirmMessage?: string;
    choiceMessage?: string;
}

export const prepareDevice =
    (
        device: Device,
        deviceSetupConfig: DeviceSetupConfig,
        onSuccess: (device: Device) => void,
        onFail: (reason?: unknown) => void,
        checkCurrentFirmwareVersion = true,
        requireUserConfirmation = true
    ) =>
    async (dispatch: TDispatch) => {
        const onSuccessWrapper = (d: Device) => {
            onSuccess(d);
            dispatch(closeDeviceSetupDialog());
        };
        const validDeviceSetups = deviceSetupConfig.deviceSetups.filter(
            deviceSetup => deviceSetup.supportsProgrammingMode(device)
        );

        const possibleFirmware = validDeviceSetups
            .map(deviceSetup => deviceSetup.getFirmwareOptions(device))
            .flat();

        if (possibleFirmware.length === 0) {
            logger.info(
                `Connected to device with serial number: ${device.serialNumber} ` +
                    `and family: ${device.jlink?.deviceFamily || 'Unknown'} `
            );
            if (deviceSetupConfig.allowCustomDevice) {
                logger.info(
                    'Note: no pre-compiled firmware is available for the selected device. ' +
                        'You may still use the app if you have programmed the device ' +
                        'with a compatible firmware.'
                );
                onSuccessWrapper(device);
            } else {
                logger.info(
                    'Note: no pre-compiled firmware is available for the selected device. '
                );
                onFail('No device setup found');
            }

            return;
        }

        if (checkCurrentFirmwareVersion) {
            // eslint-disable-next-line no-restricted-syntax
            for (const deviceSetup of validDeviceSetups) {
                // eslint-disable-next-line no-await-in-loop
                const result = await dispatch(
                    deviceSetup.isExpectedFirmware(device)
                );
                device = result.device;
                if (result.validFirmware) {
                    onSuccessWrapper(device);
                    return;
                }
            }
        }

        const choices = possibleFirmware
            .map(
                fw => `${fw.key}${fw.description ? ` - ${fw.description}` : ''}`
            )
            .flat();

        const proceedAction = (choice: number) => {
            const selectedDeviceSetup = possibleFirmware[choice];

            if (!selectedDeviceSetup) {
                onFail('No firmware was selected'); // Should never happen
            } else {
                dispatch(
                    selectedDeviceSetup.programDevice(
                        (progress: number, message?: string) => {
                            dispatch(setDeviceSetupProgress(progress));
                            if (message)
                                dispatch(
                                    setDeviceSetupProgressMessage(message)
                                );
                        }
                    )
                )
                    .then(onSuccessWrapper)
                    .catch(onFail);
            }
        };

        const cancelAction = async () => {
            let i = 0;
            do {
                const deviceSetup = validDeviceSetups[i];
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const result = await dispatch(
                        deviceSetup.tryToSwitchToApplicationMode(device)
                    );
                    if (result) {
                        onSuccessWrapper(result);
                        return;
                    }
                } catch (error) {
                    onFail(error);
                    return;
                }

                i += 1;
            } while (i < validDeviceSetups.length);

            onSuccessWrapper(device);
        };

        if (choices.length === 1) {
            if (requireUserConfirmation) {
                dispatch(
                    openDeviceSetupDialog({
                        onUserInput: isCanceled => {
                            if (isCanceled) {
                                cancelAction();
                            } else {
                                proceedAction(0);
                            }
                        },
                        message:
                            deviceSetupConfig.confirmMessage ??
                            'Device must be programmed, do you want to proceed?',
                    })
                );
            } else {
                dispatch(
                    openDeviceSetupDialog({
                        message:
                            deviceSetupConfig.confirmMessage ??
                            'Device must be programmed, do you want to proceed?',
                    })
                );
                proceedAction(0);
            }
        } else {
            dispatch(
                openDeviceSetupDialog({
                    onUserInput: (isCanceled, index) => {
                        if (isCanceled) {
                            cancelAction();
                        } else {
                            proceedAction(index ?? 0);
                        }
                    },
                    message:
                        deviceSetupConfig.choiceMessage ??
                        'Which firmware do you want to program?',
                })
            );
        }
    };

export const setupDevice =
    (
        device: Device,
        deviceSetupConfig: DeviceSetupConfig,
        onDeviceIsReady: (device: Device) => void,
        doDeselectDevice: () => void
    ) =>
    (dispatch: TDispatch, getState: () => RootState) =>
        dispatch(
            prepareDevice(
                device,
                {
                    allowCustomDevice: false,
                    ...deviceSetupConfig,
                },
                d => {
                    // Given that this task has async elements to it one might call setupDevice and
                    // while that is still in progress select some other device
                    // if both were to call onDeviceIsReady the app might have unexpected side effects
                    if (
                        getState().device.selectedSerialNumber ===
                        d.serialNumber
                    ) {
                        onDeviceIsReady(d);
                    }
                },
                error => {
                    dispatch(closeDeviceSetupDialog());
                    logger.error(
                        `Error while setting up device ${device.serialNumber}`
                    );
                    logger.error(describeError(error));
                    doDeselectDevice();
                }
            )
        );
