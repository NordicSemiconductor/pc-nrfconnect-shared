/// <reference types="node" />
import { AppThunk } from '../store';
import { DeviceSetup, DfuEntry } from './deviceSetup';
import { Device } from './deviceSlice';
import { DfuImage } from './initPacket';
export declare const isDeviceInDFUBootloader: (device: Device) => boolean;
export declare const ensureBootloaderMode: (device: Device) => boolean;
export declare const switchToBootloaderMode: (device: Device, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => AppThunk;
export declare const switchToApplicationMode: (device: Device, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void) => AppThunk;
export declare const sdfuDeviceSetup: (dfuFirmware: DfuEntry[], needSerialport?: boolean) => DeviceSetup;
declare const _default: {
    createDfuZipBuffer: (dfuImages: DfuImage[]) => Promise<Buffer>;
};
export default _default;
//# sourceMappingURL=sdfuOperations.d.ts.map