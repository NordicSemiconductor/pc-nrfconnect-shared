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
import { Device, RootState, TDispatch } from '../state';
import { getDeviceLibContext } from './deviceLibWrapper';
import { DEFAULT_DEVICE_WAIT_TIME_MS } from './DeviceSelector/useAutoReconnectDevice';
import {
    addDevice,
    removeDevice,
    setDevices,
    setForceAutoReconnect,
} from './deviceSlice';

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
        onDeviceDeselected: () => void
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
                            dispatch(removeDevice(toRemove));
                            onDeviceDisconnected(toRemove);
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
    timeoutMS = DEFAULT_DEVICE_WAIT_TIME_MS
) =>
    new Promise<Device>((resolve, reject) => {
        dispatch(
            setForceAutoReconnect({
                timeoutMS,
                onSuccess: (device: Device) => {
                    resolve(device);
                },
                onFail: () => {
                    reject();
                },
            })
        );
    });
