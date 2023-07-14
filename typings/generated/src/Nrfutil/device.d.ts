/// <reference types="node" />
import { CancelablePromise } from 'cancelable-promise';
import { WithRequired } from '../utils/AppTypes';
import { DeviceCore, DeviceCoreInfo, DeviceTraits, FWInfo, GetProtectionStatusResult, McuState, NrfutilDevice, ProgrammingOptions } from './deviceTypes';
import { type NrfutilSandboxType } from './sandbox';
import { CancellableOperation, Progress } from './sandboxTypes';
export type NrfUtilDeviceType = ReturnType<typeof NrfUtilDevice>;
declare const NrfUtilDevice: (sandbox: NrfutilSandboxType) => {
    program: (device: WithRequired<NrfutilDevice, 'serialNumber'>, firmwarePath: string, onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
    programBuffer: (device: WithRequired<NrfutilDevice, 'serialNumber'>, firmware: Buffer, type: 'hex' | 'zip', onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
    erase: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    recover: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    reset: (device: WithRequired<NrfutilDevice, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    getProtectionStatus: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    setProtectionStatus: (device: WithRequired<NrfutilDevice, 'serialNumber'>, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    fwInfo: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<FWInfo>;
    setMcuState: (device: WithRequired<NrfutilDevice, 'serialNumber'>, state: McuState, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    coreInfo: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<DeviceCoreInfo>;
    list: (traits: DeviceTraits, onEnumerated: (device: WithRequired<NrfutilDevice, 'serialNumber'>) => void, onError: (error: Error) => void, onHotplugEvent?: {
        onDeviceArrived: (device: WithRequired<NrfutilDevice, 'serialNumber'>) => void;
        onDeviceLeft: (id: number) => void;
    } | undefined) => CancellableOperation;
    firmwareRead: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Buffer>;
    onLogging: (handler: (logging: import("./sandboxTypes").LogMessage) => void) => () => ((logging: import("./sandboxTypes").LogMessage) => void)[];
    setLogLevel: (level: import("./sandboxTypes").LogLevel) => void;
    setVerboseLogging: (verbose: boolean) => void;
    getModuleVersion: () => Promise<import("./sandboxTypes").ModuleVersion>;
};
declare const getDeviceLib: () => Promise<{
    program: (device: WithRequired<NrfutilDevice, 'serialNumber'>, firmwarePath: string, onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
    programBuffer: (device: WithRequired<NrfutilDevice, 'serialNumber'>, firmware: Buffer, type: 'hex' | 'zip', onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions) => CancelablePromise<void>;
    erase: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    recover: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    reset: (device: WithRequired<NrfutilDevice, 'serialNumber'>, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    getProtectionStatus: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    setProtectionStatus: (device: WithRequired<NrfutilDevice, 'serialNumber'>, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<GetProtectionStatusResult>;
    fwInfo: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<FWInfo>;
    setMcuState: (device: WithRequired<NrfutilDevice, 'serialNumber'>, state: McuState, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<void>;
    coreInfo: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<DeviceCoreInfo>;
    list: (traits: DeviceTraits, onEnumerated: (device: WithRequired<NrfutilDevice, 'serialNumber'>) => void, onError: (error: Error) => void, onHotplugEvent?: {
        onDeviceArrived: (device: WithRequired<NrfutilDevice, 'serialNumber'>) => void;
        onDeviceLeft: (id: number) => void;
    } | undefined) => CancellableOperation;
    firmwareRead: (device: WithRequired<NrfutilDevice, 'serialNumber'>, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined) => CancelablePromise<Buffer>;
    onLogging: (handler: (logging: import("./sandboxTypes").LogMessage) => void) => () => ((logging: import("./sandboxTypes").LogMessage) => void)[];
    setLogLevel: (level: import("./sandboxTypes").LogLevel) => void;
    setVerboseLogging: (verbose: boolean) => void;
    getModuleVersion: () => Promise<import("./sandboxTypes").ModuleVersion>;
}>;
export default getDeviceLib;
