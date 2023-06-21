/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib, {
    Device as NrfdlDevice,
    DeviceTraits,
    HotplugEvent,
} from '@nordicsemiconductor/nrf-device-lib-js';

import logger from '../logging';
import type { AppDispatch, RootState } from '../store';
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
import { getDeviceLibContext } from './deviceLibWrapper';
import { closeDeviceSetupDialog } from './deviceSetupSlice';
import { addDevice, Device, removeDevice, setDevices } from './deviceSlice';
import { isDeviceInDFUBootloader } from './sdfuOperations';

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
    (onTimeout: () => void, waitForDevice: WaitForDevice) =>
    (dispatch: AppDispatch) => {
        const timeout = waitForDevice.timeout;

        dispatch(setOnCancelTimeout(onTimeout));

        dispatch(
            setWaitForDeviceTimeout(
                setTimeout(() => {
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

let hotplugTaskId: bigint | null = null;

/**
 * Wrap the device form nrf-device-lib to make the Device type consistent
 *
 * @param {Device} device The input device from nrf-device-lib
 * @returns {Device} The updated device
 */
export const wrapDeviceFromNrfdl = (device: NrfdlDevice): Device => ({
    ...device,
    boardVersion: device.jlink?.boardVersion ?? undefined,
    serialport: device.serialPorts?.[0] ?? undefined,
    serialNumber: device.serialNumber ?? `fallback-serialnumber-${device.id}`,
});

/**
 * Wrap the device form nrf-device-lib to make the Device type consistent
 *
 * @param {Device[]} devices The input devices from nrf-device-lib
 * @returns {Device[]} The updated devices
 */
export const wrapDevicesFromNrfdl = (devices: NrfdlDevice[]): Device[] =>
    devices.map(wrapDeviceFromNrfdl);

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
        remove: Device,
        onDeviceDeselected: () => void,
        onDeviceDisconnected: (device: Device) => void
    ) =>
    (dispatch: AppDispatch, getState: () => RootState) => {
        if (remove.serialNumber === getState().device.selectedSerialNumber) {
            onDeviceDeselected();
        }

        if (
            remove.serialNumber === getState().device.selectedSerialNumber &&
            !getState().deviceAutoSelect.waitForDevice
        ) {
            dispatch(closeDeviceSetupDialog());
        }

        if (!getState().deviceAutoSelect.arrivedButWrongWhen) {
            dispatch(removeDevice(remove));
            onDeviceDisconnected(remove);
        }
    };
/*
 * Starts watching for devices with the given traits. See the nrf-device-lib
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
    ) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
        const updateDeviceList = (event: HotplugEvent) => {
            switch (event.event_type) {
                case 'NRFDL_DEVICE_EVENT_ARRIVED':
                    if (!event.device) {
                        return;
                    }
                    if (
                        hasValidDeviceTraits(
                            event.device?.traits,
                            deviceListing
                        )
                    ) {
                        const device = wrapDeviceFromNrfdl(event.device);
                        if (
                            !getState().device.devices.has(device.serialNumber)
                        ) {
                            onDeviceConnected(device);
                        }

                        const sn = getState().device.selectedSerialNumber;
                        const disconnectionTime =
                            getState().deviceAutoSelect.disconnectionTime;
                        const autoSelectDevice =
                            getState().deviceAutoSelect.device;
                        const selectedDevice =
                            sn !== null
                                ? getState().device.devices.get(sn)
                                : undefined;

                        const result = shouldAutoReselect(
                            device,
                            getState().deviceAutoSelect.autoReselect,
                            autoSelectDevice,
                            disconnectionTime,
                            selectedDevice
                        );

                        dispatch(addDevice(device));
                        const deviceWithPersistedData =
                            getState().device.devices.get(device.serialNumber);

                        if (!deviceWithPersistedData) return;

                        if (result) {
                            logger.info(
                                `Auto Reconnecting Device SN: ${deviceWithPersistedData.serialNumber}`
                            );
                            doSelectDevice(deviceWithPersistedData, true);
                        } else if (
                            deviceWithPersistedData.serialNumber ===
                            getState().deviceAutoSelect.device?.serialNumber
                        ) {
                            const waitForDevice =
                                getState().deviceAutoSelect.waitForDevice;

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
                                    getState().deviceAutoSelect
                                        .lastArrivedDeviceId !==
                                        deviceWithPersistedData.id) ||
                                    (disconnectionTime ?? 0) +
                                        waitForDevice.timeout >=
                                        Date.now())
                            ) {
                                if (
                                    waitForDevice.when === 'always' ||
                                    (waitForDevice.when ===
                                        'dfuBootLoaderMode' &&
                                        isDeviceInDFUBootloader(
                                            deviceWithPersistedData
                                        )) ||
                                    (waitForDevice.when === 'applicationMode' &&
                                        deviceWithPersistedData.dfuTriggerInfo !==
                                            null) ||
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

                                    logger.info(
                                        'Wait For Device was successfully'
                                    );

                                    dispatch(
                                        clearWaitForDeviceTimeout(
                                            waitForDevice.once
                                        )
                                    );

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
                    break;
                case 'NRFDL_DEVICE_EVENT_LEFT':
                    {
                        const devices = getState().device.devices;

                        devices.forEach(device => {
                            if (device.id === event.device_id) {
                                const waitForDevice =
                                    getState().deviceAutoSelect.waitForDevice;
                                if (
                                    device.serialNumber ===
                                    getState().deviceAutoSelect.device
                                        ?.serialNumber
                                ) {
                                    if (waitForDevice) {
                                        dispatch(
                                            setArrivedButWrongWhen(undefined)
                                        );

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
                    }
                    break;
            }
        };

        try {
            stopWatchingDevices();
            const nrfdlDevices = await nrfDeviceLib.enumerate(
                getDeviceLibContext(),
                deviceListing
            );

            const currentDevices = wrapDevicesFromNrfdl(nrfdlDevices);
            dispatch(setDevices(currentDevices));

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

            hotplugTaskId = nrfDeviceLib.startHotplugEvents(
                getDeviceLibContext(),
                () => {},
                updateDeviceList
            );
        } catch (error) {
            logger.logError(
                'Error while probing devices, more details in the debug log',
                error
            );
        }
    };

const getAutoSelectDeviceCLISerial = () => {
    const { argv } = process;
    const serialIndex = argv.findIndex(arg => arg === '--deviceSerial');
    return serialIndex > -1 ? argv[serialIndex + 1] : undefined;
};

/**
 * Stops watching for devices.
 *
 * @returns {undefined}
 */
export const stopWatchingDevices = () => {
    // Not sure, if this guard clause is really needed
    if (getDeviceLibContext() && hotplugTaskId !== null) {
        try {
            // @ts-expect-error Type will be updated in device-lib-js
            nrfDeviceLib.stopHotplugEvents(hotplugTaskId);
            hotplugTaskId = null;
        } catch (error) {
            logger.logError('Error while stopping to watch devices', error);
        }
    }
};
