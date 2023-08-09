import { DeviceTraits, NrfutilDevice } from '../../nrfutil/device/common';
import type { AppThunk, RootState } from '../store';
import { Device } from './deviceSlice';
/**
 * Wrap the device form nrfutil-device to make the Device type consistent
 *
 * @param {NrfutilDevice} device The input device from nrfutil-device
 * @returns {NrfutilDevice} The updated device
 */
export declare const wrapDeviceFromNrfdl: (device: NrfutilDevice) => Device;
/**
 * Wrap the device form nrfutil-device to make the Device type consistent
 *
 * @param {NrfutilDevice[]} devices The input devices from nrfutil-device
 * @returns {NrfutilDevice[]} The updated devices
 */
export declare const wrapDevicesFromNrfdl: (devices: NrfutilDevice[]) => Device[];
export declare const hasValidDeviceTraits: (deviceTraits: DeviceTraits, requiredTraits: DeviceTraits) => boolean;
export declare const startWatchingDevices: (deviceListing: DeviceTraits, onDeviceConnected: (device: Device) => void, onDeviceDisconnected: (device: Device) => void, onDeviceDeselected: () => void, doSelectDevice: (device: Device, autoReselected: boolean) => void) => AppThunk<RootState, void>;
export declare const clearWaitForDevice: () => AppThunk;
export declare const stopWatchingDevices: (callback?: () => void) => void;
//# sourceMappingURL=deviceLister.d.ts.map