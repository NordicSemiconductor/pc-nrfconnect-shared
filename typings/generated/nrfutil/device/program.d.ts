/// <reference types="node" />
import { Progress } from '../sandboxTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber, ResetKind } from './common';
export type ProgrammingOptions = JLinkProgrammingOptions | McuBootProgrammingOptions | NordicDfuProgrammingOptions;
export interface JLinkProgrammingOptions {
    chipEraseMode?: 'ERASE_ALL' | 'ERASE_NONE';
    reset?: ResetKind;
    verify?: 'VERIFY_HASH' | 'VERIFY_NONE' | 'VERIFY_READ';
}
export interface McuBootProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
    netCoreUploadDelay?: number;
}
export interface NordicDfuProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
}
export declare const isJLinkProgrammingOptions: (options: ProgrammingOptions) => options is JLinkProgrammingOptions;
export declare const isMcuBootProgrammingOptions: (options: ProgrammingOptions) => options is McuBootProgrammingOptions;
export declare const isNordicDfuProgrammingOptions: (options: ProgrammingOptions) => options is NordicDfuProgrammingOptions;
declare const _default: (device: NrfutilDeviceWithSerialnumber, firmware: {
    buffer: Buffer;
    type: 'hex' | 'zip';
} | string, onProgress?: ((progress: Progress) => void) | undefined, core?: DeviceCore, programmingOptions?: ProgrammingOptions, controller?: AbortController) => Promise<void>;
export default _default;
//# sourceMappingURL=program.d.ts.map