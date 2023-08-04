/// <reference types="node" />
import { firmwareRead } from '@nordicsemiconductor/nrf-device-lib-js';
import { LogLevel, LogMessage } from '../sandboxTypes';
declare const _default: {
    program: (device: import("./common").NrfutilDeviceWithSerialnumber, firmware: string | {
        buffer: Buffer;
        type: "hex" | "zip";
    }, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, core?: import("./common").DeviceCore | undefined, programmingOptions?: import("./program").ProgrammingOptions | undefined, controller?: AbortController | undefined) => Promise<void>;
    erase: (device: import("./common").NrfutilDeviceWithSerialnumber, core?: import("./common").DeviceCore | undefined, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<NonNullable<void>>;
    recover: (device: import("./common").NrfutilDeviceWithSerialnumber, core?: import("./common").DeviceCore | undefined, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<NonNullable<void>>;
    reset: (device: import("./common").NrfutilDeviceWithSerialnumber, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<NonNullable<void>>;
    getProtectionStatus: (device: import("./common").NrfutilDeviceWithSerialnumber, core?: import("./common").DeviceCore | undefined, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<import("./getProtectionStatus").GetProtectionStatusResult>;
    setProtectionStatus: (device: import("./common").NrfutilDeviceWithSerialnumber, region: "All" | "SecureRegions" | "Region0" | "Region0Region1", core?: import("./common").DeviceCore | undefined, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<NonNullable<void>>;
    getFwInfo: (device: import("./common").NrfutilDeviceWithSerialnumber, core?: import("./common").DeviceCore | undefined, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<import("./getFwInfo").FWInfo>;
    setMcuState: (device: import("./common").NrfutilDeviceWithSerialnumber, state: "Application" | "Programming", onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<NonNullable<void>>;
    getCoreInfo: (device: import("./common").NrfutilDeviceWithSerialnumber, core?: import("./common").DeviceCore | undefined, onProgress?: ((progress: import("../sandboxTypes").Progress) => void) | undefined, controller?: AbortController | undefined) => Promise<import("./getCoreInfo").DeviceCoreInfo>;
    list: (traits: import("./common").DeviceTraits, onEnumerated: (devices: import("./common").NrfutilDeviceWithSerialnumber[]) => void, onError: (error: Error) => void, onHotplugEvent?: {
        onDeviceArrived: (device: import("./common").NrfutilDeviceWithSerialnumber) => void;
        onDeviceLeft: (id: number) => void;
    } | undefined) => Promise<{
        stop: (handler: () => void) => void;
        isRunning: () => boolean;
        onClosed: (handler: (error?: Error | undefined) => void) => () => ((error?: Error | undefined) => void)[];
    }>;
    firmwareRead: typeof firmwareRead;
    onLogging: (handler: (logging: LogMessage) => void) => Promise<() => ((logging: LogMessage) => void)[]>;
    setLogLevel: (level: LogLevel) => Promise<void>;
    setVerboseLogging: (verbose: boolean) => Promise<void>;
    getModuleVersion: () => Promise<import("../sandboxTypes").ModuleVersion>;
};
export default _default;
//# sourceMappingURL=device.d.ts.map