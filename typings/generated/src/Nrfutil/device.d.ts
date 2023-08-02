/// <reference types="node" />
import { CancelablePromise } from 'cancelable-promise';
import { DeviceCore, DeviceCoreInfo, DeviceTraits, FWInfo, GetProtectionStatusResult, McuState, NrfutilDeviceWithSerialnumber, ProgrammingOptions } from './deviceTypes';
import { CancellableOperation, LogLevel, LogMessage, Progress } from './sandboxTypes';
declare const list: (traits: DeviceTraits, onEnumerated: (device: NrfutilDeviceWithSerialnumber) => void, onError: (error: Error) => void, onHotplugEvent?: {
    onDeviceArrived: (device: NrfutilDeviceWithSerialnumber) => void;
    onDeviceLeft: (id: number) => void;
} | undefined) => Promise<CancellableOperation>;
declare const program: (device: NrfutilDeviceWithSerialnumber, firmwarePath: string, onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
declare const programBuffer: (device: NrfutilDeviceWithSerialnumber, firmware: Buffer, type: 'hex' | 'zip', onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
declare const recover: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const reset: (device: NrfutilDeviceWithSerialnumber, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const getFwInfo: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<FWInfo>;
declare const setMcuState: (device: NrfutilDeviceWithSerialnumber, state: McuState, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const getCoreInfo: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<DeviceCoreInfo>;
declare const firmwareRead: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Buffer>;
declare const erase: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const getProtectionStatus: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
declare const setProtectionStatus: (device: NrfutilDeviceWithSerialnumber, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
declare const onLogging: (handler: (logging: LogMessage) => void) => Promise<() => ((logging: LogMessage) => void)[]>;
declare const setLogLevel: (level: LogLevel) => Promise<void>;
declare const setVerboseLogging: (verbose: boolean) => Promise<void>;
declare const getModuleVersion: () => Promise<import("./sandboxTypes").ModuleVersion>;
export { program, programBuffer, erase, recover, reset, getProtectionStatus, setProtectionStatus, getFwInfo, setMcuState, getCoreInfo, list, firmwareRead, onLogging, setLogLevel, setVerboseLogging, getModuleVersion, };
//# sourceMappingURL=device.d.ts.map