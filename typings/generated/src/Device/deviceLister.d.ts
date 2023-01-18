import { Device as NrfdlDevice, DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import { Device, RootState, TDispatch } from '../state';
/**
 * Wrap the device form nrf-device-lib to make the Device type consistent
 *
 * @param {Device} device The input device from nrf-device-lib
 * @returns {Device} The updated device
 */
export declare const wrapDeviceFromNrfdl: (device: NrfdlDevice) => Device;
/**
 * Wrap the device form nrf-device-lib to make the Device type consistent
 *
 * @param {Device[]} devices The input devices from nrf-device-lib
 * @returns {Device[]} The updated devices
 */
export declare const wrapDevicesFromNrfdl: (devices: NrfdlDevice[]) => Device[];
export declare const hasValidDeviceTraits: (deviceTraits: DeviceTraits, requiredTraits: DeviceTraits) => boolean;
export declare const startWatchingDevices: (deviceListing: DeviceTraits, onDeviceConnected: (device: Device) => void, onDeviceDisconnected: (device: Device) => void, onDeviceDeselected: () => void) => (dispatch: TDispatch, getState: () => RootState) => Promise<void>;
/**
 * Stops watching for devices.
 *
 * @returns {undefined}
 */
export declare const stopWatchingDevices: () => void;
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
export declare const waitForDevice: (serialNumber: string, timeout?: number, expectedTraits?: DeviceTraits) => Promise<Device>;
