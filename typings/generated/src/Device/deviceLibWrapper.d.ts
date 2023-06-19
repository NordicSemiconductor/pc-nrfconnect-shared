import { LogEvent, ModuleVersion } from '@nordicsemiconductor/nrf-device-lib-js';
export declare const getDeviceLibContext: () => bigint;
export declare const logNrfdlLogs: (evt: LogEvent) => void;
export declare const forwardLogEventsFromDeviceLib: () => () => void;
export declare const setVerboseDeviceLibLogging: (verboseLogging: boolean) => void;
type KnownModule = 'nrfdl' | 'nrfdl-js' | 'jprog' | 'JlinkARM';
export declare const getModuleVersion: (module: KnownModule, versions?: ModuleVersion[]) => ModuleVersion | undefined;
export {};
