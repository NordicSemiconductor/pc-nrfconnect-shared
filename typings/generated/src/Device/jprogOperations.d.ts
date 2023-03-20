/// <reference types="node" />
import { FWInfo } from '@nordicsemiconductor/nrf-device-lib-js';
import { Device, RootState, TDispatch } from '../state';
import type { DeviceSetup } from './deviceSetup';
export declare const updateHasReadbackProtection: () => (dispatch: TDispatch, getState: () => RootState) => Promise<"unknown" | "protected" | "unprotected">;
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
