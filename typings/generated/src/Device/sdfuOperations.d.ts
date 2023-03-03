/// <reference types="node" />
import { Device, TDispatch } from '../state';
import type { DeviceSetup } from './deviceSetup';
import { DfuImage } from './initPacket';
export declare type PromiseConfirm = (message: string) => Promise<boolean>;
export declare type PromiseChoice = (question: string, choices: string[]) => Promise<string>;
export declare const isDeviceInDFUBootloader: (device: Device) => boolean;
export declare const ensureBootloaderMode: (device: Device) => boolean;
export declare const switchToBootloaderMode: (device: Device, dispatch: TDispatch, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => void;
export declare const switchToApplicationMode: (device: Device, dispatch: TDispatch, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => void;
export declare const confirmHelper: (promiseConfirm?: PromiseConfirm) => Promise<boolean>;
export declare const choiceHelper: (choices: string[], promiseChoice?: PromiseChoice) => string | Promise<string>;
export declare const performDFU: (selectedDevice: Device, options: DeviceSetup, dispatch: TDispatch, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => void;
declare const _default: {
    createDfuZipBuffer: (dfuImages: DfuImage[]) => Promise<Buffer>;
};
export default _default;
