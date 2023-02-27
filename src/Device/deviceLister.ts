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
import { Device, ForceAutoReselect, RootState, TDispatch } from '../state';
import {
    clearAutoReconnectTimeoutID,
    clearAutoReselect,
    setAutoReconnectTimeoutID,
    setDisconnectedTime,
    setForceAutoReselect,
} from './deviceAutoSelectSlice';
import { getDeviceLibContext } from './deviceLibWrapper';
import {
    addDevice,
    closeSetupDialogVisible,
    removeDevice,
    setDevices,
} from './deviceSlice';
import { isDeviceInDFUBootloader } from './sdfuOperations';

const hasSameDeviceTraits = (
    deviceTraits: DeviceTraits,
    otherDeviceTraits: DeviceTraits
) =>
    Object.keys(otherDeviceTraits).every(
        rule =>
            deviceTraits[rule as keyof DeviceTraits] ===
            otherDeviceTraits[rule as keyof DeviceTraits]
    );

const shouldAutoReconnect = (
    addedDevice: Device,
    globalAutoReconnect: boolean,
    autoReconnectDevice?: Device,
    disconnectionTime?: number,
    currentSelectedDevice?: Device,
    forceReselect?: ForceAutoReselect
): {
    autoReconnect: boolean;
    forcedAutoReconnected: boolean;
} => {
    // No device was selected when disconnection occurred
    if (!autoReconnectDevice)
        return {
            autoReconnect: false,
            forcedAutoReconnected: false,
        };

    // device is still connected
    if (disconnectionTime === undefined)
        return {
            autoReconnect: false,
            forcedAutoReconnected: false,
        };

    // The device that was selected when disconnection occurred is not yet connected
    if (addedDevice.serialNumber !== autoReconnectDevice.serialNumber) {
        return {
            autoReconnect: false,
            forcedAutoReconnected: false,
        };
    }

    // The device is already selected
    if (
        currentSelectedDevice?.serialNumber === autoReconnectDevice.serialNumber
    ) {
        return {
            autoReconnect: false,
            forcedAutoReconnected: false,
        };
    }

    // Device is to be reconnected as timeout is provided
    if (
        forceReselect &&
        disconnectionTime + forceReselect.timeout >= Date.now()
    ) {
        if (forceReselect.when === 'always') {
            logger.info(`Force Auto Reconnecting`);
            return {
                autoReconnect: true,
                forcedAutoReconnected: true,
            };
        }

        if (
            forceReselect.when === 'BootLoaderMode' &&
            isDeviceInDFUBootloader(addedDevice)
        ) {
            logger.info(`Force Auto Reconnecting in Boot Loader Mode`);
            return {
                autoReconnect: true,
                forcedAutoReconnected: true,
            };
        }

        if (
            forceReselect.when === 'applicationMode' &&
            addedDevice.dfuTriggerInfo !== null
        ) {
            logger.info(`Force Auto Reconnecting in Application Mode`);
            return {
                autoReconnect: true,
                forcedAutoReconnected: true,
            };
        }
    }

    // Device does not have the same traits
    if (!hasSameDeviceTraits(addedDevice.traits, autoReconnectDevice.traits)) {
        return {
            autoReconnect: false,
            forcedAutoReconnected: false,
        };
    }

    return globalAutoReconnect
        ? {
              autoReconnect: true,
              forcedAutoReconnected: false,
          }
        : {
              autoReconnect: false,
              forcedAutoReconnected: false,
          };
};

const initAutoReconnectTimeout = (
    dispatch: TDispatch,
    forceAutoReselect?: ForceAutoReselect
) => {
    const timeout = forceAutoReselect?.timeout;
    if (timeout == null) return;

    dispatch(
        setAutoReconnectTimeoutID(
            setTimeout(() => {
                dispatch(clearAutoReselect());
                dispatch(closeSetupDialogVisible());
                if (forceAutoReselect?.onFail) forceAutoReselect?.onFail();
                logger.warn(
                    `Auto Reconnect failed. Device did not show up after ${
                        timeout / 1000
                    } seconds`
                );
            }, timeout)
        )
    );
};

let hotplugTaskId: number;

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
        doSelectDevice: (
            device: Device,
            autoReconnected: boolean,
            forcedAutoReconnected: boolean
        ) => void
    ) =>
    async (dispatch: TDispatch, getState: () => RootState) => {
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
                        const result = shouldAutoReconnect(
                            device,
                            getState().deviceAutoSelect.globalAutoReselect,
                            getState().deviceAutoSelect.device,
                            getState().deviceAutoSelect.disconnectionTime,
                            sn !== null
                                ? getState().device.devices.get(sn)
                                : undefined,
                            getState().deviceAutoSelect.forceReselect
                        );

                        if (result.autoReconnect) {
                            logger.info(
                                `Auto Reconnecting Device SN: ${device.serialNumber}`
                            );
                            dispatch(clearAutoReconnectTimeoutID());
                            doSelectDevice(
                                device,
                                true,
                                result.forcedAutoReconnected
                            );

                            const onSuccess =
                                getState().deviceAutoSelect.forceReselect
                                    ?.onSuccess;

                            if (result.forcedAutoReconnected && onSuccess)
                                onSuccess(device);
                        }

                        dispatch(addDevice(device));
                    }
                    break;
                case 'NRFDL_DEVICE_EVENT_LEFT':
                    {
                        const devices = getState().device.devices;

                        let toRemove: Device | undefined;
                        devices.forEach(device => {
                            if (device.id === event.device_id) {
                                toRemove = device;
                            }
                        });

                        if (toRemove) {
                            if (
                                toRemove?.serialNumber ===
                                getState().device.selectedSerialNumber
                            ) {
                                onDeviceDeselected();
                            }

                            if (
                                toRemove?.serialNumber ===
                                    getState().device.selectedSerialNumber &&
                                getState().deviceAutoSelect.forceReselect
                            ) {
                                dispatch(closeSetupDialogVisible());
                            }

                            dispatch(removeDevice(toRemove));
                            onDeviceDisconnected(toRemove);

                            if (
                                toRemove.serialNumber ===
                                getState().deviceAutoSelect.device?.serialNumber
                            ) {
                                if (getState().deviceAutoSelect.forceReselect)
                                    initAutoReconnectTimeout(
                                        dispatch,
                                        getState().deviceAutoSelect
                                            .forceReselect
                                    );

                                dispatch(setDisconnectedTime(Date.now()));
                            }
                        }
                    }
                    break;
            }
        };

        try {
            const nrfdlDevices = await nrfDeviceLib.enumerate(
                getDeviceLibContext(),
                deviceListing
            );
            const currentDevices = wrapDevicesFromNrfdl(nrfdlDevices);
            dispatch(setDevices(currentDevices));

            const autoSelectSN = getAutoSelectDeviceCLISerial();

            if (autoSelectSN !== undefined) {
                const autoSelectDevice =
                    getState().device.devices.get(autoSelectSN);

                if (autoSelectDevice)
                    doSelectDevice(autoSelectDevice, true, false);
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
    if (getDeviceLibContext()) {
        try {
            nrfDeviceLib.stopHotplugEvents(hotplugTaskId);
        } catch (error) {
            logger.logError('Error while stopping to watch devices', error);
        }
    }
};

export const waitForAutoReconnect = (
    dispatch: TDispatch,
    forceAutoReconnect: Omit<ForceAutoReselect, 'once'>
): Promise<Device> =>
    new Promise<Device>((resolve, reject) => {
        dispatch(
            setForceAutoReselect({
                timeout: forceAutoReconnect.timeout,
                when: forceAutoReconnect.when,
                once: true,
                onSuccess: (device: Device) => {
                    if (forceAutoReconnect.onSuccess)
                        forceAutoReconnect.onSuccess(device);
                    resolve(device);
                },
                onFail: () => {
                    if (forceAutoReconnect.onFail) forceAutoReconnect.onFail();
                    reject();
                },
            })
        );
    });
