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
    setReadbackProtected,
} from './deviceSlice';
import { InitPacket } from './initPacket';
import { programFirmware, validateFirmware } from './jprogOperations';
import {
    confirmHelper,
    isDeviceInDFUBootloader,
    performDFU,
    PromiseChoice,
    PromiseConfirm,
    switchToApplicationMode,
} from './sdfuOperations';

export interface DfuEntry {
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}
export interface DeviceSetup {
    dfu?: {
        [key: string]: DfuEntry;
    };
    jprog?: {
        [key: string]: {
            fw: string;
            fwIdAddress: number;
            fwVersion: string;
        };
    };
    needSerialport?: boolean; // only used if dfu OR jprog available in the `DeviceSetup`
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

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

const prepareDFUDevice = async (
    device: Device,
    deviceSetupConfig: WithRequired<DeviceSetup, 'dfu'>,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    // Check if device is in DFU-Bootloader, it might only have serialport
    if (isDeviceInDFUBootloader(device)) {
        logger.debug('Device is in DFU-Bootloader, DFU is defined');

        const isConfirmed = await confirmHelper(
            deviceSetupConfig.promiseConfirm
        );
        if (!isConfirmed) {
            switchToApplicationMode(device, dispatch, onSuccess, onFail);
        } else {
            performDFU(device, deviceSetupConfig, dispatch, onSuccess, onFail);
        }
    } else if (device.dfuTriggerVersion) {
        logger.debug(
            'Device has DFU trigger interface, the device is in Application mode'
        );

        const { semVer } = device.dfuTriggerVersion;

        if (
            Object.keys(deviceSetupConfig.dfu)
                .map(key => deviceSetupConfig.dfu[key].semver)
                .includes(semVer)
        ) {
            onSuccess(device);
            return;
        }
        const isConfirmed = await confirmHelper(
            deviceSetupConfig.promiseConfirm
        );
        if (!isConfirmed) {
            onSuccess(device);
            return;
        }

        performDFU(device, deviceSetupConfig, dispatch, onSuccess, onFail);
    } else {
        onSuccess(device);
    }
};

const prepareJProgDevice = async (
    device: Device,
    deviceSetupConfig: WithRequired<DeviceSetup, 'jprog'>,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    const family = (device.jlink?.deviceFamily || '').toLowerCase();
    const deviceType = (device.jlink?.deviceVersion || '').toLowerCase();
    const shortDeviceType = deviceType.split('_').shift();
    const boardVersion = (device.jlink?.boardVersion || '').toLowerCase();

    const key =
        Object.keys(deviceSetupConfig.jprog).find(
            k => k.toLowerCase() === deviceType
        ) ||
        Object.keys(deviceSetupConfig.jprog).find(
            k => k.toLowerCase() === shortDeviceType
        ) ||
        Object.keys(deviceSetupConfig.jprog).find(
            k => k.toLowerCase() === boardVersion
        ) ||
        Object.keys(deviceSetupConfig.jprog).find(
            k => k.toLowerCase() === family
        );

    if (!key) {
        onFail(new Error('No firmware defined for selected device'));
        return;
    }

    logger.debug('Found matching firmware definition', key);
    const { fw, fwVersion } = deviceSetupConfig.jprog[key];
    const valid = await validateFirmware(device, fwVersion);

    dispatch(
        setReadbackProtected(
            valid === 'READBACK_PROTECTION_ENABLED'
                ? 'protected'
                : 'unprotected'
        )
    );

    if (valid) {
        onSuccess(device);
    } else {
        programFirmware(device, fw, deviceSetupConfig, dispatch)
            .then(() => onSuccess(device))
            .catch(() => onFail(new Error('Failed to program firmware')));
    }
};

const verifySerialPortAvailableAndFree = (
    device: Device,
    needSerialport?: boolean
) => {
    if (!needSerialport) {
        return Promise.resolve();
    }

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

const prepareDevice = (
    device: Device,
    deviceSetupConfig: DeviceSetup,
    dispatch: TDispatch,
    onSuccess: (device: Device) => void,
    onFail: (reason?: unknown) => void
) => {
    if (deviceSetupConfig.jprog && device.traits.jlink) {
        verifySerialPortAvailableAndFree(
            device,
            deviceSetupConfig.needSerialport
        )
            .then(() => {
                prepareJProgDevice(
                    device,
                    deviceSetupConfig as WithRequired<DeviceSetup, 'jprog'>,
                    dispatch,
                    onSuccess,
                    onFail
                );
            })
            .catch(onFail);
    } else if (
        deviceSetupConfig.dfu &&
        Object.keys(deviceSetupConfig.dfu).length > 0
    ) {
        verifySerialPortAvailableAndFree(
            device,
            deviceSetupConfig.needSerialport
        )
            .then(() => {
                prepareDFUDevice(
                    device,
                    deviceSetupConfig as WithRequired<DeviceSetup, 'dfu'>,
                    dispatch,
                    onSuccess,
                    onFail
                );
            })
            .catch(onFail);
    } else {
        onSuccess(device);
    }
};

const onSuccessfulDeviceSetup = (
    dispatch: TDispatch,
    device: Device,
    onDeviceIsReady: (device: Device) => void
) => {
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
    async (dispatch: TDispatch) => {
        await releaseCurrentDevice();
        const deviceSetupConfig = {
            promiseConfirm: getDeviceSetupUserInput(dispatch) as PromiseConfirm,
            promiseChoice: getDeviceSetupUserInput(dispatch) as PromiseChoice,
            allowCustomDevice: false,
            ...deviceSetup,
        };

        prepareDevice(
            device,
            deviceSetupConfig,
            dispatch,
            d => {
                onSuccessfulDeviceSetup(dispatch, d, onDeviceIsReady);
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

                    onSuccessfulDeviceSetup(dispatch, device, onDeviceIsReady);
                } else {
                    dispatch(deviceSetupError());
                    logger.error(
                        `Error while setting up device ${device.serialNumber}`
                    );
                    if (error instanceof Error) logger.error(error.message);
                    doDeselectDevice();
                }
            }
        );
    };
