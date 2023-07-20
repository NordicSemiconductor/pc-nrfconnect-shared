import { ModuleVersion } from '@nordicsemiconductor/nrf-device-lib-js';
export declare const getDeviceLibContext: () => bigint;
type KnownModule = 'nrfdl' | 'nrfdl-js' | 'jprog' | 'JlinkARM';
export declare const getModuleVersion: (module: KnownModule, versions?: ModuleVersion[]) => ModuleVersion | undefined;
export {};
//# sourceMappingURL=deviceLibWrapper.d.ts.map