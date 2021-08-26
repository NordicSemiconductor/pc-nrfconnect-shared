/* eslint-disable @typescript-eslint/ban-types */
/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// eslint-disable-next-line import/no-unresolved
import nrfDeviceLib, {
    DeviceTraits,
    HotplugEvent,
} from '@nordicsemiconductor/nrf-device-lib-js';
import camelcaseKeys from 'camelcase-keys';
// eslint-disable-next-line import/no-unresolved
import { Device, DeviceListing, Serialport } from 'pc-nrfconnect-shared';

import logger from '../logging';
import { devicesDetected } from './deviceActions';

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
export const wrapDeviceFromNrfdl = (device: Device): Device => {
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
export const wrapDevicesFromNrfdl = (devices: Device[]): Device[] =>
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
            let devices: Device[] = (await nrfDeviceLib.enumerate(
                getDeviceLibContext(),
                deviceListing as unknown as DeviceTraits
            )) as unknown as Device[];
            devices = wrapDevicesFromNrfdl(devices);

            const { selectedSerialNumber } = getState().device;
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
        } catch (error) {
            logger.error(`Error while probing devices: ${error.message}`);
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
            logger.error(`Error while stop watching devices: ${error.message}`);
        }
    }
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
 * @param {DeviceListing} [expectedTraits] The traits that the device is expected to have
 * @returns {Promise} resolved to the expected device
 */
export const waitForDevice = (
    serialNumber: string,
    timeout = DEFAULT_DEVICE_WAIT_TIME,
    expectedTraits: DeviceListing = { serialPort: true }
) => {
    logger.debug(`Will wait for device ${serialNumber}`);

    // To be compatible with `serialport`
    expectedTraits = {
        serialPort: expectedTraits.serialport,
    };

    return new Promise((resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        nrfDeviceLib.enumerate(
            getDeviceLibContext(),
            expectedTraits as unknown as DeviceTraits
        );
        nrfDeviceLib.startHotplugEvents(
            getDeviceLibContext(),
            () => {},
            (event: HotplugEvent) => {
                const { device: inputDevice } = event;
                if (!inputDevice) return;

                const device = wrapDeviceFromNrfdl(
                    inputDevice as unknown as Device
                );
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
