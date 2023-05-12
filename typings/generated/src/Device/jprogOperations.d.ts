/// <reference types="node" />
import { Device, TDispatch } from '../state';
import type { DeviceSetup, IDeviceSetup, JprogEntry } from './deviceSetup';
export declare const jProgDeviceSetup: (firmware: JprogEntry[]) => IDeviceSetup;
export declare function programFirmware(device: Device, fw: string | Buffer, deviceSetupConfig: DeviceSetup, dispatch: TDispatch): Promise<Device>;
