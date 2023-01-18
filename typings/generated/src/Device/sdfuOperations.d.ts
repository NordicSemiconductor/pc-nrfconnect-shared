import { Device } from '../state';
import type { DeviceSetup } from './deviceSetup';
import { DfuImage } from './initPacket';
export declare type PromiseConfirm = (message: string) => Promise<boolean>;
export declare type PromiseChoice = (question: string, choices: string[]) => Promise<string>;
export declare const isDeviceInDFUBootloader: (device: Device) => boolean;
/**
 * Trigger DFU Bootloader mode if the device is not yet in that mode.
 *
 * @param {Object} device device
 * @returns {Promise<Object>} device object which is already in bootloader.
 */
export declare const ensureBootloaderMode: (device: Device) => Device;
/**
 * DFU procedure which also tries to update bootloader in case bootloader mode is
 * set during the process and it happens to be outdated.
 *
 * @param {Object} selectedDevice device
 * @param {Object} options options
 * @returns {Promise} device or { device, details } object
 */
export declare const performDFU: (selectedDevice: Device, options: DeviceSetup) => Promise<Device>;
declare const _default: {
    createDfuZipBuffer: (dfuImages: DfuImage[]) => Promise<Buffer>;
};
export default _default;
//# sourceMappingURL=sdfuOperations.d.ts.map