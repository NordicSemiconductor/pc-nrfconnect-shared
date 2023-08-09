import { Progress } from '../sandboxTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber } from './common';
export type DeviceCoreInfo = {
    name: 'core-info';
    codeAddress: number;
    codePageSize: number;
    codeSize: number;
    uicrAddress: number;
    infoPageSize: number;
    codeRamPresent: boolean;
    codeRamAddress: number;
    dataRamAddress: number;
    ramSize: number;
    qspiPresent: boolean;
    xipAddress: number;
    xipSize: number;
    pinResetPin: number;
    serialNumber: string;
};
declare const _default: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController) => Promise<DeviceCoreInfo>;
export default _default;
//# sourceMappingURL=getCoreInfo.d.ts.map