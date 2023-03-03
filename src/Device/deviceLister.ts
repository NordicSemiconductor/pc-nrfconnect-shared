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
import { Device, RootState, TDispatch, WaitForDevice } from '../state';
import {
    clearWaitForDeviceTimeout,
    setDisconnectedTime,
    setLastArrivedDeviceId,
    setWaitForDevice,
    setWaitForDeviceTimeout,
} from './deviceAutoSelectSlice';
import { getDeviceLibContext } from './deviceLibWrapper';
import {
    addDevice,
    closeSetupDialogVisible,
    removeDevice,
    setDevices,
} from './deviceSlice';
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

const initAutoReconnectTimeout = (
    dispatch: TDispatch,
    onTimeout: () => void,
    forceAutoReselect?: WaitForDevice
) => {
    const timeout = forceAutoReselect?.timeout;
    if (timeout == null) return;

    dispatch(
        setWaitForDeviceTimeout(
            setTimeout(() => {
                dispatch(closeSetupDialogVisible());
                if (forceAutoReselect?.onFail)
                    forceAutoReselect?.onFail(
                        `Auto Reconnect failed. Device did not show up after ${
                            timeout / 1000
                        } seconds`
                    );
                onTimeout();
                logger.warn(
                    `Auto Reconnect failed. Device did not show up after ${
                        timeout / 1000
                    } seconds`
                );
            }, timeout)
        )
    );
};

let hotplugTaskId: number | null = null;

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
    async (dispatch: TDispatch, getState: () => RootState) => {
        const updateDeviceList = (event: HotplugEvent) => {
            const removeDeviceFromList = (remove: Device) => {
                if (
                    remove.serialNumber ===
                    getState().device.selectedSerialNumber
                ) {
                    onDeviceDeselected();
                }

                if (
                    remove.serialNumber ===
                        getState().device.selectedSerialNumber &&
                    !getState().deviceAutoSelect.waitForDevice
                ) {
                    dispatch(closeSetupDialogVisible());
                }

                dispatch(removeDevice(remove));
                onDeviceDisconnected(remove);
            };

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

                        const result = shouldAutoReselect(
                            device,
                            getState().deviceAutoSelect.autoReselect,
                            autoSelectDevice,
                            disconnectionTime,
                            sn !== null
                                ? getState().device.devices.get(sn)
                                : undefined
                        );

                        if (result) {
                            logger.info(
                                `Auto Reconnecting Device SN: ${device.serialNumber}`
                            );
                            doSelectDevice(device, true);
                        }

                        if (
                            device.serialNumber ===
                            getState().deviceAutoSelect.device?.serialNumber
                        ) {
                            const waitForDevice =
                                getState().deviceAutoSelect.waitForDevice;
                            // Device is to be reconnected as timeout is provided
                            if (
                                waitForDevice &&
                                ((disconnectionTime === undefined &&
                                    getState().deviceAutoSelect
                                        .lastArrivedDeviceId !== device.id) ||
                                    (disconnectionTime ?? 0) +
                                        waitForDevice.timeout >=
                                        Date.now())
                            ) {
                                dispatch(setLastArrivedDeviceId(device.id));
                                dispatch(setDisconnectedTime(undefined));
                                if (
                                    waitForDevice.when === 'always' ||
                                    (waitForDevice.when === 'BootLoaderMode' &&
                                        isDeviceInDFUBootloader(device)) ||
                                    (waitForDevice.when === 'applicationMode' &&
                                        device.dfuTriggerInfo !== null)
                                ) {
                                    logger.info(
                                        'Wait For Device was successfully'
                                    );

                                    dispatch(clearWaitForDeviceTimeout());
                                    if (waitForDevice.once) {
                                        dispatch(setWaitForDevice(undefined));
                                    }

                                    if (waitForDevice.onSuccess)
                                        waitForDevice.onSuccess(device);
                                }
                            }
                        }

                        dispatch(addDevice(device));
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
                                        initAutoReconnectTimeout(
                                            dispatch,
                                            () => removeDeviceFromList(device),
                                            getState().deviceAutoSelect
                                                .waitForDevice
                                        );
                                    } else {
                                        removeDeviceFromList(device);
                                    }

                                    dispatch(setDisconnectedTime(Date.now()));
                                } else {
                                    removeDeviceFromList(device);
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
            nrfDeviceLib.stopHotplugEvents(hotplugTaskId);
            hotplugTaskId = null;
        } catch (error) {
            logger.logError('Error while stopping to watch devices', error);
        }
    }
};
