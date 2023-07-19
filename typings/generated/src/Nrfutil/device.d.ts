/// <reference types="node" />
import { CancelablePromise } from 'cancelable-promise';
import { WithRequired } from '../utils/AppTypes';
import { DeviceCore, DeviceCoreInfo, DeviceTraits, FWInfo, GetProtectionStatusResult, McuState, NrfutilDevice, ProgrammingOptions } from './deviceTypes';
import { CancellableOperation, LogLevel, LogMessage, Progress } from './sandboxTypes';
declare const list: (traits: DeviceTraits, onEnumerated: (device: WithRequired<NrfutilDevice, 'serialNumber'>) => void, onError: (error: Error) => void, onHotplugEvent?: {
    onDeviceArrived: (device: WithRequired<NrfutilDevice, 'serialNumber'>) => void;
    onDeviceLeft: (id: number) => void;
} | undefined) => Promise<CancellableOperation>;
declare const program: (device: WithRequired<NrfutilDevice, 'serialNumber'>, firmwarePath: string, onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
declare const programBuffer: (device: WithRequired<NrfutilDevice, 'serialNumber'>, firmware: Buffer, type: 'hex' | 'zip', onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
declare const recover: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const reset: (device: WithRequired<NrfutilDevice, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const getFwInfo: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<FWInfo>;
declare const setMcuState: (device: WithRequired<NrfutilDevice, 'serialNumber'>, state: McuState, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const getCoreInfo: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<DeviceCoreInfo>;
declare const firmwareRead: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Buffer>;
declare const erase: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
declare const getProtectionStatus: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
declare const setProtectionStatus: (device: WithRequired<NrfutilDevice, 'serialNumber'>, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
declare const onLogging: (handler: (logging: LogMessage) => void) => Promise<() => ((logging: LogMessage) => void)[]>;
declare const setLogLevel: (level: LogLevel) => Promise<void>;
declare const setVerboseLogging: (verbose: boolean) => Promise<void>;
declare const getModuleVersion: () => Promise<import("./sandboxTypes").ModuleVersion>;
export { program, programBuffer, erase, recover, reset, getProtectionStatus, setProtectionStatus, getFwInfo, setMcuState, getCoreInfo, list, firmwareRead, onLogging, setLogLevel, setVerboseLogging, getModuleVersion, };
