/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DeviceTraits,
    NrfutilDeviceWithSerialnumber,
} from '../../nrfutil/device/common';
import NrfutilDeviceLib from '../../nrfutil/device/device';
import { DeviceInfo } from '../../nrfutil/device/deviceInfo';
import logger from '../logging';
import type { AppThunk, RootState } from '../store';
import {
    clearWaitForDevice,
    clearWaitForDeviceTimeout,
    setArrivedButWrongWhen,
    setDisconnectedTime,
    setLastArrivedDeviceId,
    setOnCancelTimeout,
    setWaitForDeviceTimeout,
    WaitForDevice,
} from './deviceAutoSelectSlice';
import { closeDeviceSetupDialog } from './deviceSetupSlice';
import {
    addDevice,
    Device,
    removeDevice,
    selectDevice,
    setSelectedDeviceInfo,
} from './deviceSlice';
import { isDeviceInDFUBootloader } from './sdfuOperations';

let stopNrfutilDevice: (callback?: () => void) => void;
let autoSelectDeviceCLISerialUsed = false;

const hasSameDeviceTraits = (
    deviceTraits: DeviceTraits,
    otherDeviceTraits: DeviceTraits
) =>
    Object.keys(otherDeviceTraits).every(
        rule =>
            deviceTraits[rule as keyof DeviceTraits] ===
            otherDeviceTraits[rule as keyof DeviceTraits]
    );

const shouldAutoReselect = (
    addedDevice: Device,
    globalAutoReselect: boolean,
    autoReselectDevice?: Device,
    disconnectionTime?: number,
    currentSelectedDevice?: Device
): boolean => {
    // No device was selected when disconnection occurred
    if (!autoReselectDevice) return false;

    // device is still connected
    if (disconnectionTime === undefined) return false;

    // The device that was selected when disconnection occurred is not yet connected
    if (addedDevice.serialNumber !== autoReselectDevice.serialNumber) {
        return false;
    }

    // The device is already selected
    if (
        currentSelectedDevice?.serialNumber === autoReselectDevice.serialNumber
    ) {
        return false;
    }

    // Device does not have the same traits
    if (!hasSameDeviceTraits(addedDevice.traits, autoReselectDevice.traits)) {
        return false;
    }

    return globalAutoReselect;
};

const initAutoReconnectTimeout =
    (onTimeout: () => void, waitForDevice: WaitForDevice): AppThunk =>
    dispatch => {
        const timeout = waitForDevice.timeout;

        dispatch(setOnCancelTimeout(onTimeout));

        dispatch(
            setWaitForDeviceTimeout(
                window.setTimeout(() => {
                    dispatch(closeDeviceSetupDialog());
                    if (waitForDevice?.onFail)
                        waitForDevice?.onFail(
                            `Failed to detect device after reboot. Timed out after ${
                                timeout / 1000
                            } seconds.`
                        );
                    dispatch(clearWaitForDevice());
                    logger.warn(
                        `Failed to detect device after reboot. Timed out after ${
                            timeout / 1000
                        } seconds.`
                    );
                }, timeout)
            )
        );
    };

/**
 * Wrap the device form nrfutil-device to make the Device type consistent
 *
 * @param {NrfutilDevice} device The input device from nrfutil-device
 * @returns {NrfutilDevice} The updated device
 */
export const wrapDeviceFromNrfdl = (
    device: NrfutilDeviceWithSerialnumber
): Device => ({
    ...device,
    serialport: device.serialPorts?.[0] ?? undefined,
});

/**
 * Wrap the device form nrfutil-device to make the Device type consistent
 *
 * @param {NrfutilDevice[]} devices The input devices from nrfutil-device
 * @returns {NrfutilDevice[]} The updated devices
 */
export const wrapDevicesFromNrfdl = (
    devices: NrfutilDeviceWithSerialnumber[]
): Device[] => devices.map(wrapDeviceFromNrfdl);

export const hasValidDeviceTraits = (
    deviceTraits: DeviceTraits,
    requiredTraits: DeviceTraits
) =>
    Object.keys(requiredTraits).some(
        rule =>
            deviceTraits[rule as keyof DeviceTraits] &&
            requiredTraits[rule as keyof DeviceTraits]
    ) ||
    Object.keys(requiredTraits).every(
        rule => requiredTraits[rule as keyof DeviceTraits] === false
    );

const removeDeviceFromList =
    (
        removedDevice: Device,
        onDeviceDeselected: () => void,
        onDeviceDisconnected: (device: Device) => void
    ): AppThunk =>
    (dispatch, getState) => {
        if (
            removedDevice.serialNumber !==
            getState().device.selectedDevice?.serialNumber
        ) {
            dispatch(removeDevice(removedDevice));
            onDeviceDisconnected(removedDevice);
            return;
        }

        onDeviceDeselected();

        if (!getState().deviceAutoSelect.waitForDevice) {
            dispatch(closeDeviceSetupDialog());
        }

        if (!getState().deviceAutoSelect.arrivedButWrongWhen) {
            dispatch(removeDevice(removedDevice));
            onDeviceDisconnected(removedDevice);
        }
    };
/*
 * Starts watching for devices with the given traits. See the nrfutil-device
 * library for available traits. Whenever devices are attached/detached, this
 * will dispatch AddDevice or removeDevice and trigger events.
 */
export const startWatchingDevices =
    (
        deviceListing: DeviceTraits,
        onDeviceConnected: (device: Device) => void,
        onDeviceDisconnected: (device: Device) => void,
        onDeviceDeselected: () => void,
        doSelectDevice: (device: Device, autoReselected: boolean) => void
    ): AppThunk<RootState, void> =>
    (dispatch, getState) => {
        const onDeviceArrived = async (
            device: NrfutilDeviceWithSerialnumber
        ) => {
            if (hasValidDeviceTraits(device.traits, deviceListing)) {
                device = wrapDeviceFromNrfdl(device);
                if (
                    device.serialNumber &&
                    !getState().device.devices.has(device.serialNumber)
                ) {
                    onDeviceConnected(device);
                }

                const disconnectionTime =
                    getState().deviceAutoSelect.disconnectionTime;
                const autoSelectDevice = getState().deviceAutoSelect.device;
                const selectedDevice = getState().device.selectedDevice;

                const result = shouldAutoReselect(
                    device,
                    getState().deviceAutoSelect.autoReselect,
                    autoSelectDevice,
                    disconnectionTime,
                    selectedDevice
                );

                dispatch(addDevice(device));
                const deviceWithPersistedData = getState().device.devices.get(
                    device.serialNumber
                );

                if (!deviceWithPersistedData) return;

                if (result) {
                    let deviceInfo: DeviceInfo | undefined;
                    try {
                        deviceInfo = await NrfutilDeviceLib.deviceInfo(device);
                    } catch (e) {
                        // DO nothing
                    }

                    logger.info(
                        `Auto Reconnecting Device SN: ${deviceWithPersistedData.serialNumber}`
                    );
                    doSelectDevice(deviceWithPersistedData, true);
                    dispatch(setSelectedDeviceInfo(deviceInfo));
                } else if (
                    deviceWithPersistedData.serialNumber ===
                    getState().deviceAutoSelect.device?.serialNumber
                ) {
                    const waitForDevice =
                        getState().deviceAutoSelect.waitForDevice;

                    let deviceInfo: DeviceInfo | undefined;
                    try {
                        deviceInfo = await NrfutilDeviceLib.deviceInfo(device);
                    } catch (e) {
                        // DO nothing
                    }

                    // Device lib might fail to advertise that a device has left before it rejoins (Mainly OSx)
                    // but we still need to trigger the onSuccess if a device 'reappeared' with a different 'id'
                    // and there is an outstanding waitForDevice Request. In this case the disconnectionTime was
                    // never set (as NRFDL_DEVICE_EVENT_LEFT was never sent) This created an additional problem as device
                    // lib may advertise the the same device with a single connect event. Hance we are keeping track of
                    // the device ID which is guaranteed to be change if a is disconnected and reconnected (for the
                    // same hotplug event listener) to ensure we only call the onSuccess once for every reconnect event.
                    // This is mostly relevant when 'when' is always

                    // Device is to be reconnected as timeout is provided
                    if (
                        waitForDevice &&
                        ((disconnectionTime === undefined &&
                            getState().deviceAutoSelect.lastArrivedDeviceId !==
                                deviceWithPersistedData.id) ||
                            (disconnectionTime ?? 0) + waitForDevice.timeout >=
                                Date.now())
                    ) {
                        if (
                            waitForDevice.when === 'always' ||
                            (waitForDevice.when === 'dfuBootLoaderMode' &&
                                isDeviceInDFUBootloader(
                                    deviceWithPersistedData
                                )) ||
                            (waitForDevice.when === 'applicationMode' &&
                                deviceInfo?.dfuTriggerVersion) ||
                            (selectedDevice &&
                                waitForDevice.when === 'sameTraits' &&
                                hasSameDeviceTraits(
                                    device.traits,
                                    selectedDevice.traits
                                )) ||
                            (typeof waitForDevice.when === 'function' &&
                                waitForDevice.when(device))
                        ) {
                            dispatch(
                                setLastArrivedDeviceId(
                                    deviceWithPersistedData.id
                                )
                            );
                            dispatch(setDisconnectedTime(undefined));

                            logger.info('Wait For Device was successfully');

                            dispatch(
                                clearWaitForDeviceTimeout(waitForDevice.once)
                            );

                            dispatch(selectDevice(deviceWithPersistedData));
                            dispatch(setSelectedDeviceInfo(deviceInfo));

                            if (waitForDevice.onSuccess)
                                waitForDevice.onSuccess(
                                    deviceWithPersistedData
                                );
                        } else {
                            dispatch(setArrivedButWrongWhen(true));
                        }
                    }
                }
            }
        };
        const onDeviceLeft = (id: number) => {
            const devices = getState().device.devices;

            devices.forEach(device => {
                if (device.id === id) {
                    const waitForDevice =
                        getState().deviceAutoSelect.waitForDevice;
                    if (
                        device.serialNumber ===
                        getState().deviceAutoSelect.device?.serialNumber
                    ) {
                        if (waitForDevice) {
                            dispatch(setArrivedButWrongWhen(undefined));

                            dispatch(
                                initAutoReconnectTimeout(
                                    () =>
                                        dispatch(
                                            removeDeviceFromList(
                                                device,
                                                onDeviceDeselected,
                                                onDeviceDisconnected
                                            )
                                        ),
                                    waitForDevice
                                )
                            );
                        } else {
                            dispatch(
                                removeDeviceFromList(
                                    device,
                                    onDeviceDeselected,
                                    onDeviceDisconnected
                                )
                            );
                        }

                        dispatch(setDisconnectedTime(Date.now()));
                    } else {
                        dispatch(
                            removeDeviceFromList(
                                device,
                                onDeviceDeselected,
                                onDeviceDisconnected
                            )
                        );
                    }
                }
            });
        };

        stopWatchingDevices(async () => {
            const operation = await NrfutilDeviceLib.list(
                deviceListing,
                d => d.forEach(onDeviceArrived),
                error => {
                    logger.error(error);
                },
                { onDeviceArrived, onDeviceLeft }
            );

            stopNrfutilDevice = (callback?: () => void) => {
                operation.stop(() => {
                    callback?.();
                });
            };

            if (!autoSelectDeviceCLISerialUsed) {
                const autoSelectSN = getAutoSelectDeviceCLISerial();

                if (autoSelectSN !== undefined) {
                    const autoSelectDevice =
                        getState().device.devices.get(autoSelectSN);

                    if (autoSelectDevice)
                        doSelectDevice(autoSelectDevice, true);
                }
                autoSelectDeviceCLISerialUsed = true;
            }
        });
    };

const getAutoSelectDeviceCLISerial = () => {
    const { argv } = process;
    const serialIndex = argv.findIndex(arg => arg === '--deviceSerial');
    return serialIndex > -1 ? argv[serialIndex + 1] : undefined;
};

export const stopWatchingDevices = (callback?: () => void) => {
    if (stopNrfutilDevice) stopNrfutilDevice(callback);
    else callback?.();
};
