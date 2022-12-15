/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/ban-types */

import { webContents } from '@electron/remote';
import nrfDeviceLib, {
    Device as NrfdlDevice,
    DeviceTraits,
    HotplugEvent,
} from '@nordicsemiconductor/nrf-device-lib-js';
import { ipcRenderer } from 'electron';
import { Device } from 'pc-nrfconnect-shared';

import logger from '../logging';
import { Devices } from '../state';
import { getDeviceLibContext } from './deviceLibWrapper';
import { devicesDetected } from './deviceSlice';

const DEFAULT_DEVICE_WAIT_TIME = 3000;

let hotplugTaskId: number;

ipcRenderer.on('reload-window', (_event, webContentsId) => {
    const currentWebContentsId = webContents.getFocusedWebContents().id;
    if (currentWebContentsId === webContentsId) {
        stopWatchingDevices();
        logger.info('Did call stopWatchingDevices');
    }
});

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

/**
 * Starts watching for devices with the given traits. See the nrf-device-lib
 * library for available traits. Whenever devices are attached/detached, this
 * will dispatch DEVICES_DETECTED with a complete list of attached devices.
 *
 * @param {Object} deviceListing The configuration for the DeviceLister
 * @param {function(device)} doDeselectDevice Invoke to start deselect the current device
 * @returns {function(*)} Function that can be passed to redux dispatch.
 */
export const startWatchingDevices =
    (deviceListing: DeviceTraits, doDeselectDevice: Function) =>
    async (dispatch: Function, getState: Function): Promise<void> => {
        const updateDeviceList = async () => {
            const { selectedSerialNumber, devices: devicesFromState } =
                getState().device;
            await waitForModeSwitch(devicesFromState, selectedSerialNumber);
            const nrfdlDevices = await nrfDeviceLib.enumerate(
                getDeviceLibContext(),
                deviceListing
            );
            const devices = wrapDevicesFromNrfdl(nrfdlDevices);
            const hasSerialNumber = (d: Device) =>
                d.serialNumber === selectedSerialNumber;

            if (
                selectedSerialNumber !== null &&
                !devices.find(hasSerialNumber)
            ) {
                doDeselectDevice();
            }

            dispatch(devicesDetected(devices));
        };

        try {
            await updateDeviceList();
            hotplugTaskId = nrfDeviceLib.startHotplugEvents(
                getDeviceLibContext(),
                () => {},
                updateDeviceList
            );
            logger.warn(
                'Did run startHotplugEvents and got id: ',
                hotplugTaskId
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
    if (hotplugTaskId) {
        try {
            nrfDeviceLib.stopHotplugEvents(hotplugTaskId);
            logger.warn(`Did call stopHotplugEvents on id ${hotplugTaskId}`);
        } catch (error) {
            logger.logError('Error while stopping to watch devices', error);
        }
    }
};

const DEFAULT_TRAITS: DeviceTraits = {
    serialPorts: true,
};

/**
 * Waits until a device (with a matching serial number) is listed by
 * nrf-device-lister, up to a maximum of `timeout` milliseconds.
 *
 * If `expectedTraits` is given, then the device must (in addition to
 * a matching serial number) also have the given traits. See the
 * nrf-device-lister library for the full list of traits.
 *
 * @param {string} serialNumber of the device expected to appear
 * @param {number} [timeout] Timeout, in milliseconds, to wait for device enumeration
 * @param {DeviceTraits} [expectedTraits] The traits that the device is expected to have
 * @returns {Promise} resolved to the expected device
 */
export const waitForDevice = (
    serialNumber: string,
    timeout = DEFAULT_DEVICE_WAIT_TIME,
    expectedTraits: DeviceTraits = DEFAULT_TRAITS
) => {
    logger.debug(`Will wait for device ${serialNumber}`);
    return new Promise<Device>((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        nrfDeviceLib.enumerate(getDeviceLibContext(), expectedTraits);
        const hotplugEventsId = nrfDeviceLib.startHotplugEvents(
            getDeviceLibContext(),
            () => {},
            (event: HotplugEvent) => {
                const { device: nrfdlDevice } = event;
                if (!nrfdlDevice) return;

                const device = wrapDeviceFromNrfdl(nrfdlDevice);
                const isTraitIncluded = () =>
                    Object.keys(expectedTraits).every(
                        trait => device.traits[trait as keyof DeviceTraits]
                    );
                if (
                    device &&
                    device.serialNumber === serialNumber &&
                    isTraitIncluded()
                ) {
                    clearTimeout(timeoutId);
                    nrfDeviceLib.stopHotplugEvents(hotplugEventsId);
                    resolve(device);
                }
            }
        );
        timeoutId = setTimeout(() => {
            logger.debug(
                `Timeout when waiting for attachment of device with serial number ${serialNumber}`
            );
            nrfDeviceLib.stopHotplugEvents(hotplugEventsId);
            reject(
                new Error(
                    `Timeout while waiting for device  ${serialNumber} to be attached and enumerated`
                )
            );
        }, timeout);
    });
};

const waitForModeSwitch = async (
    devices: Devices,
    selectedSerialNumber: string
) => {
    const hasDfuTriggerVersion =
        devices[selectedSerialNumber]?.dfuTriggerVersion != null;

    // Wait some time in case device is being put in either app or bootloader mode
    if (hasDfuTriggerVersion) {
        try {
            await waitForDevice(selectedSerialNumber, DEFAULT_DEVICE_WAIT_TIME);
        } catch (err) {
            logger.debug(
                `Device did not show up after ${
                    DEFAULT_DEVICE_WAIT_TIME / 1000
                } seconds`
            );
        }
    }
};
