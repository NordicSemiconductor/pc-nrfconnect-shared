import { Device as NrfdlDevice, DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import type { AppThunk } from '../store';
import { Device } from './deviceSlice';
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
export declare const startWatchingDevices: (deviceListing: DeviceTraits, onDeviceConnected: (device: Device) => void, onDeviceDisconnected: (device: Device) => void, onDeviceDeselected: () => void, doSelectDevice: (device: Device, autoReselected: boolean) => void) => AppThunk<Promise<void>>;
export declare const clearWaitForDevice: () => AppThunk;
/**
 * Stops watching for devices.
 *
 * @returns {undefined}
 */
export declare const stopWatchingDevices: () => void;
