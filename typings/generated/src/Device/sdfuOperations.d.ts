/// <reference types="node" />
import { Device, TDispatch } from '../state';
import type { DeviceSetup } from './deviceSetup';
import { DfuImage } from './initPacket';
export declare type PromiseConfirm = (message: string) => Promise<boolean>;
export declare type PromiseChoice = (question: string, choices: string[]) => Promise<string>;
export declare const isDeviceInDFUBootloader: (device: Device) => boolean;
export declare const ensureBootloaderMode: (device: Device) => boolean;
export declare const performDFU: (selectedDevice: Device, options: DeviceSetup, dispatch: TDispatch, autoReconnected: boolean) => Promise<void>;
declare const _default: {
    createDfuZipBuffer: (dfuImages: DfuImage[]) => Promise<Buffer>;
};
export default _default;
