/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable @typescript-eslint/ban-types */

// eslint-disable-next-line import/no-unresolved
import nrfDeviceLib, {
    Device as nrfdlDevice,
    DeviceTraits,
    HotplugEvent,
    stopHotplugEvents,
} from '@nordicsemiconductor/nrf-device-lib-js';
import camelcaseKeys from 'camelcase-keys';
// eslint-disable-next-line import/no-unresolved
import { Device, DeviceListing, Serialport } from 'pc-nrfconnect-shared';

import logger from '../logging';
import { Devices } from '../state';
import { devicesDetected } from './deviceSlice';

const DEFAULT_DEVICE_WAIT_TIME = 3000;

const deviceLibContext = nrfDeviceLib.createContext();
export const getDeviceLibContext = () => deviceLibContext;

let hotplugTaskId: number;

/**
 * Wrap the device form nrf-device-lib to make the Device type consistent
 *
 * @param {Device} device The input device from nrf-device-lib
 * @returns {Device} The updated device
 */
export const wrapDeviceFromNrfdl = (device: nrfdlDevice): Device => {
    let outputDevice: Device = camelcaseKeys(device, { deep: true }) as Device;
    let serialport: Serialport | undefined = outputDevice.serialports
        ? (outputDevice.serialports[0] as unknown as Serialport)
        : undefined;
    serialport = outputDevice.serialPorts
        ? (outputDevice.serialPorts[0] as unknown as Serialport)
        : serialport;
    outputDevice = {
        ...outputDevice,
        boardVersion: outputDevice.jlink
            ? outputDevice.jlink.boardVersion
            : undefined,
        serialNumber: outputDevice.serialnumber
            ? outputDevice.serialnumber
            : outputDevice.serialNumber,
        serialport,
    };
    delete outputDevice.serialnumber;
    return outputDevice;
};

/**
 * Wrap the device form nrf-device-lib to make the Device type consistent
 *
 * @param {Device[]} devices The input devices from nrf-device-lib
 * @returns {Device[]} The updated devices
 */
export const wrapDevicesFromNrfdl = (devices: nrfdlDevice[]): Device[] =>
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
    (deviceListing: DeviceListing, doDeselectDevice: Function) =>
    async (dispatch: Function, getState: Function): Promise<void> => {
        const updateDeviceList = async () => {
            const { selectedSerialNumber, devices: devicesFromState } =
                getState().device;
            await waitForModeSwitch(devicesFromState, selectedSerialNumber);
            const nrfDevices = await nrfDeviceLib.enumerate(
                getDeviceLibContext(),
                deviceListing as unknown as DeviceTraits
            );
            const devices = wrapDevicesFromNrfdl(nrfDevices);
            const hasSerialNumber = (d: Device) => {
                return d.serialNumber === selectedSerialNumber;
            };

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
        } catch (error) {
            const message = error instanceof Error ? error.message : error;
            logger.error(`Error while probing devices: ${message}`);
        }
    };

/**
 * Stops watching for devices.
 *
 * @returns {undefined}
 */
export const stopWatchingDevices = () => {
    // Start here
    if (getDeviceLibContext()) {
        try {
            nrfDeviceLib.stopHotplugEvents(hotplugTaskId);
        } catch (error) {
            const message = error instanceof Error ? error.message : error;
            logger.error(`Error while stop watching devices: ${message}`);
        }
    }
};

const DEFAULT_TRAITS: DeviceTraits = {
    usb: false,
    nordicUsb: false,
    nordicDfu: false,
    seggerUsb: false,
    jlink: false,
    serialPort: true,
    broken: false,
    mcuboot: false,
    modem: false,
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

    // To be compatible with `serialport`
    expectedTraits.serialPort = (<any>expectedTraits).serialport;

    return new Promise<Device>((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        nrfDeviceLib.enumerate(getDeviceLibContext(), expectedTraits);
        const hotplugEventsId = nrfDeviceLib.startHotplugEvents(
            getDeviceLibContext(),
            () => {},
            (event: HotplugEvent) => {
                const { device: inputDevice } = event;
                if (!inputDevice) return;

                const device = wrapDeviceFromNrfdl(inputDevice);
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
                    stopHotplugEvents(hotplugEventsId);
                    resolve(device);
                }
            }
        );
        timeoutId = setTimeout(() => {
            logger.debug(
                `Timeout when waiting for attachment of device with serial number ${serialNumber}`
            );
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
