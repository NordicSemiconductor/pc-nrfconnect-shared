/// <reference types="node" />
import { CancelablePromise } from 'cancelable-promise';
import { Device, DeviceCore, DeviceTraits, FWInfo, GetProtectionStatusResult, ProgrammingOptions } from './deviceTypes';
import type { NrfutilSandboxType } from './sandbox';
import { CancellableOperation, LogMessage, NrfUtilSettings, Progress, WithRequired } from './sandboxTypes';
export type NrfUtilDeviceType = ReturnType<typeof NrfUtilDevice>;
export declare const prepareAndCreate: (baseDir: string, module: string, version: string, onLogging: (logging: LogMessage) => void, setting?: NrfUtilSettings) => Promise<{
    program: (device: WithRequired<Device, 'serialNumber'>, firmwarePath: string, core: DeviceCore, programmingOptions: ProgrammingOptions, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    programBuffer: (device: WithRequired<Device, 'serialNumber'>, firmware: Buffer, type: 'hex' | 'zip', core: DeviceCore, programmingOptions: ProgrammingOptions, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    erase: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    recover: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    reset: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    getProtectionStatus: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    setProtectionStatus: (device: WithRequired<Device, 'serialNumber'>, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    fwInfo: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<FWInfo>;
    setMcuState: (device: WithRequired<Device, 'serialNumber'>, state: 'Application' | 'Programming', onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    list: (traits: DeviceTraits, onDeviceArrived: (device: WithRequired<Device, 'serialNumber'>) => void, onError: (error: Error) => void, onHotplugEvent?: {
        onDeviceLeft: (id: number) => void;
    } | undefined) => CancellableOperation;
    firmwareRead: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Buffer>;
    release: () => void;
}>;
declare const NrfUtilDevice: (sandbox: NrfutilSandboxType, onLogging: (logging: LogMessage) => void) => {
    program: (device: WithRequired<Device, 'serialNumber'>, firmwarePath: string, core: DeviceCore, programmingOptions: ProgrammingOptions, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    programBuffer: (device: WithRequired<Device, 'serialNumber'>, firmware: Buffer, type: 'hex' | 'zip', core: DeviceCore, programmingOptions: ProgrammingOptions, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    erase: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    recover: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    reset: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    getProtectionStatus: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    setProtectionStatus: (device: WithRequired<Device, 'serialNumber'>, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    fwInfo: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<FWInfo>;
    setMcuState: (device: WithRequired<Device, 'serialNumber'>, state: 'Application' | 'Programming', onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    list: (traits: DeviceTraits, onDeviceArrived: (device: WithRequired<Device, 'serialNumber'>) => void, onError: (error: Error) => void, onHotplugEvent?: {
        onDeviceLeft: (id: number) => void;
    } | undefined) => CancellableOperation;
    firmwareRead: (device: WithRequired<Device, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Buffer>;
    release: () => void;
};
export default NrfUtilDevice;
