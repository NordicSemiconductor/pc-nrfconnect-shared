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
export declare const waitForAutoReconnect: (dispatch: TDispatch, timeoutMS?: number) => Promise<Device>;
