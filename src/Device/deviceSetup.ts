/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
import { SerialPort } from 'serialport';

import logger from '../logging';
import { Device, TDispatch } from '../state';
import {
    deviceSetupComplete,
    deviceSetupError,
    deviceSetupInputReceived,
    deviceSetupInputRequired,
} from './deviceSlice';
import { InitPacket } from './initPacket';
import { PromiseChoice } from './sdfuOperations';

export interface DfuEntry {
    key: string;
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}

export interface JprogEntry {
    key: string;
    fw: string;
    fwIdAddress: number;
    fwVersion: string;
}

export type PromiseConfirm = (message: string) => Promise<boolean>;

export interface IDeviceSetup {
    supportsProgrammingMode: (device: Device) => boolean;
    // isSupportedDevice: () => boolean;
    getFirmwareOptions: (device: Device) => {
        key: string;
        programDevice: (
            promiseConfirm?: PromiseConfirm
        ) => (dispatch: TDispatch) => Promise<Device>;
    }[];
    isExpectedFirmware: (device: Device) => (dispatch: TDispatch) => Promise<{
        device: Device;
        validFirmware: boolean;
    }>;
    tryToSwitchToApplicationMode: (
        device: Device
    ) => (dispatch: TDispatch) => Promise<Device | null>;
}

export interface DeviceSetup {
    deviceSetups: IDeviceSetup[];
    needSerialport: boolean; // only used if dfu OR jprog available in the `DeviceSetup`
    allowCustomDevice?: boolean; // allow custom J-Link device
    promiseChoice?: PromiseChoice;
    promiseConfirm?: PromiseConfirm;
}

// Defined when user input is required during device setup. When input is
// received from the user, this callback is invoked with the confirmation
// (Boolean) or choice (String) that the user provided as input.
let deviceSetupCallback: ((choice: string | boolean) => void) | undefined;

/*
 * Asks the user to provide input during device setup. If a list of choices are
 * given, and the user selects one of them, then then promise will resolve with
 * the selected value. If no choices are given, and the user confirms, then the
 * promise will just resolve with true. Will reject if the user cancels.
 */
const getDeviceSetupUserInput =
    (dispatch: TDispatch) => (message: string, choices: string[]) =>
        new Promise<boolean | string>((resolve, reject) => {
            deviceSetupCallback = (choice: boolean | string) => {
                if (!choices) {
                    // for confirmation resolve with boolean
                    resolve(!!choice);
                } else if (choice) {
                    resolve(choice);
                } else {
                    reject(new Error('Cancelled by user.'));
                }
            };
            dispatch(deviceSetupInputRequired(message, choices));
        });

/*
 * Responds to a device setup confirmation request with the given input
 * as provided by the user.
 */
export const receiveDeviceSetupInput =
    (input: boolean | string) => (dispatch: TDispatch) => {
        dispatch(deviceSetupInputReceived());
        if (deviceSetupCallback) {
            deviceSetupCallback(input);
            deviceSetupCallback = undefined;
        } else {
            logger.error(
                'Received device setup input, but no callback exists.'
            );
        }
    };

const verifySerialPortAvailableAndFree = (device: Device) => {
    if (!device.serialport) {
        return Promise.reject(
            new Error(
                'No serial port available for device with ' +
                    `serial number ${device.serialNumber}`
            )
        );
    }
    return new Promise<void>((resolve, reject) => {
        if (!device.serialport?.comName) {
            reject();
            return;
        }
        const serialPort = new SerialPort({
            path: device.serialport.comName,
            // The BaudRate should not matter in this case, but as of serialport v10 it is required.
            // To be sure to keep the code as similar as possible, baudRate is set to the same as the
            // default baudRate in serialport v8.
            baudRate: 9600,
            autoOpen: false,
        });
        serialPort.open(openErr => {
            if (openErr) {
                reject(openErr);
            } else {
                serialPort.close(closeErr => {
                    if (closeErr) {
                        reject(closeErr);
                    } else {
                        resolve();
                    }
                });
            }
        });
    });
};

const choiceHelper = (choices: string[], promiseChoice?: PromiseChoice) => {
    if (choices.length > 1 && promiseChoice) {
        return promiseChoice('Which firmware do you want to program?', choices);
    }
    return choices.slice(-1)[0];
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

export const prepareDevice =
    (
        device: Device,
        deviceSetupConfig: DeviceSetup,
        onSuccess: (device: Device) => void,
        onFail: (reason?: unknown) => void,
        checkCurrentFirmwareVersion: true
    ) =>
    async (dispatch: TDispatch) => {
        const validDeviceSetups = deviceSetupConfig.deviceSetups.filter(
            deviceSetups => deviceSetups.supportsProgrammingMode(device)
        );

        const possibleFirmware = validDeviceSetups
            .map(deviceSetup => deviceSetup.getFirmwareOptions(device))
            .flat();

        if (possibleFirmware.length === 0) {
            if (deviceSetupConfig.allowCustomDevice) {
                logger.info(
                    `Connected to device with serial number: ${device.serialNumber} ` +
                        `and family: ${
                            device.jlink?.deviceFamily || 'Unknown'
                        } `
                );
                logger.info(
                    'Note: no pre-compiled firmware is available for the selected device. ' +
                        'You may still use the app if you have programmed the device ' +
                        'with a compatible firmware.'
                );
                onSuccess(device);
            } else {
                onFail('No device setup found');
            }

            return;
        }

        if (checkCurrentFirmwareVersion) {
            let validFirmware = false;
            let i = 0;
            do {
                const deviceSetup = validDeviceSetups[i];
                // eslint-disable-next-line no-await-in-loop
                const result = await dispatch(
                    deviceSetup.isExpectedFirmware(device)
                );
                device = result.device;
                validFirmware = result.validFirmware;
                i += 1;
            } while (!validFirmware && i < validDeviceSetups.length);

            if (validFirmware) {
                onSuccess(device);
                return;
            }
        }

        const choices = possibleFirmware.map(fw => fw.key).flat();

        let choice: string | null = null;
        if (choices.length === 1) {
            const isConfirmed = await confirmHelper(
                deviceSetupConfig.promiseConfirm
            );
            if (isConfirmed) {
                choice = choices[0];
            }
        } else {
            choice = await choiceHelper(
                choices,
                deviceSetupConfig.promiseChoice
            );
        }

        if (choice === null) {
            let i = 0;
            do {
                const deviceSetup = validDeviceSetups[i];
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const result = await dispatch(
                        deviceSetup.tryToSwitchToApplicationMode(device)
                    );
                    if (result) {
                        onSuccess(device);
                        return;
                    }
                } catch (error) {
                    onFail(error);
                    return;
                }

                i += 1;
            } while (i < validDeviceSetups.length);

            onSuccess(device);
        } else {
            const selectedDeviceSetup = possibleFirmware.find(
                fw => fw.key === choice
            );

            if (!selectedDeviceSetup) {
                onFail('No firmware was selected'); // Should never happen
            } else {
                dispatch(
                    selectedDeviceSetup.programDevice(
                        deviceSetupConfig.promiseConfirm
                    )
                )
                    .then(programmedDevice => {
                        if (deviceSetupConfig.needSerialport) {
                            verifySerialPortAvailableAndFree(programmedDevice)
                                .then(() => onSuccess(programmedDevice))
                                .catch(onFail);
                        } else {
                            onSuccess(device);
                        }
                    })
                    .catch(onFail);
            }
        }
    };

const onSuccessfulDeviceSetup =
    (device: Device, onDeviceIsReady: (device: Device) => void) =>
    (dispatch: TDispatch) => {
        dispatch(deviceSetupComplete(device));
        onDeviceIsReady(device);
    };

export const setupDevice =
    (
        device: Device,
        deviceSetup: DeviceSetup,
        releaseCurrentDevice: () => void,
        onDeviceIsReady: (device: Device) => void,
        doDeselectDevice: () => void
    ) =>
    (dispatch: TDispatch) => {
        releaseCurrentDevice();
        const deviceSetupConfig = {
            promiseConfirm: getDeviceSetupUserInput(dispatch) as PromiseConfirm,
            promiseChoice: getDeviceSetupUserInput(dispatch) as PromiseChoice,
            allowCustomDevice: false,
            ...deviceSetup,
        };

        dispatch(
            prepareDevice(
                device,
                deviceSetupConfig,
                d => {
                    dispatch(onSuccessfulDeviceSetup(d, onDeviceIsReady));
                },
                error => {
                    if (
                        deviceSetupConfig.allowCustomDevice &&
                        error instanceof Error &&
                        error.message.includes('No firmware defined')
                    ) {
                        logger.info(
                            `Connected to device with serial number: ${device.serialNumber} ` +
                                `and family: ${
                                    device.jlink?.deviceFamily || 'Unknown'
                                } `
                        );
                        logger.info(
                            'Note: no pre-compiled firmware is available for the selected device. ' +
                                'You may still use the app if you have programmed the device ' +
                                'with a compatible firmware.'
                        );

                        dispatch(
                            onSuccessfulDeviceSetup(device, onDeviceIsReady)
                        );
                    } else {
                        dispatch(deviceSetupError());
                        logger.error(
                            `Error while setting up device ${device.serialNumber}`
                        );
                        if (error instanceof Error) logger.error(error.message);
                        doDeselectDevice();
                    }
                },
                true
            )
        );
    };
