/// <reference types="node" />
import { Device, TDispatch } from '../state';
import { DfuEntry, IDeviceSetup } from './deviceSetup';
import { DfuImage } from './initPacket';
export declare const isDeviceInDFUBootloader: (device: Device) => boolean;
export declare const ensureBootloaderMode: (device: Device) => boolean;
export declare const switchToBootloaderMode: (device: Device, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => (dispatch: TDispatch) => void;
export declare const switchToApplicationMode: (device: Device, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => (dispatch: TDispatch) => void;
export declare const sDFUDeviceSetup: (dfuFirmware: DfuEntry[]) => IDeviceSetup;
declare const _default: {
    createDfuZipBuffer: (dfuImages: DfuImage[]) => Promise<Buffer>;
};
export default _default;
