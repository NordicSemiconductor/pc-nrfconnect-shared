/// <reference types="node" />
import { FWInfo } from '@nordicsemiconductor/nrf-device-lib-js';
import { Device } from '../state';
import type { DeviceSetup } from './deviceSetup';
/**
 * Try to open and close the given serial port to see if it is available. This
 * is needed to identify if a SEGGER J-Link device is in a bad state. If
 * pc-nrfjprog-js tries to interact with a device in bad state, it will hang
 * indefinitely.
 *
 * @param {object} device Device object, ref. nrf-device-lister.
 * @returns {Promise} Promise that resolves if available, and rejects if not.
 */
export declare const verifySerialPortAvailable: (device: Device) => Promise<void>;
/**
 * Validate the firmware on the device whether it matches the provided firmware or not
 *
 * @param {Device} device The device to be validated.
 * @param {String} fwVersion The firmware version to be matched.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
export declare function validateFirmware(device: Device, fwVersion: string | {
    validator: (imageInfoList: FWInfo.Image[], fromDeviceLib: boolean) => boolean;
}): Promise<boolean | FWInfo.Image | "READBACK_PROTECTION_ENABLED" | undefined>;
/**
 * Program the device with the given serial number with the given firmware with provided configuration
 *
 * @param {Device} device The device to be programmed.
 * @param {Object} fw Firmware path or firmware contents as buffer.
 * @param {Object} deviceSetupConfig The configuration provided.
 * @returns {Promise} Promise that resolves if successful or rejects with error.
 */
export declare function programFirmware(device: Device, fw: string | Buffer, deviceSetupConfig: DeviceSetup): Promise<Device>;
