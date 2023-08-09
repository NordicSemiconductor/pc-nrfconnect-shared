import { Progress } from '../sandboxTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber } from './common';
type BootloaderType = 'NRFDL_BOOTLOADER_TYPE_NONE' | 'NRFDL_BOOTLOADER_TYPE_MCUBOOT' | 'NRFDL_BOOTLOADER_TYPE_SDFU' | 'NRFDL_BOOTLOADER_TYPE_B0' | 'NRFDL_BOOTLOADER_TYPE_UNKNOWN';
export type ImageType = 'NRFDL_IMAGE_TYPE_APPLICATION' | 'NRFDL_IMAGE_TYPE_BOOTLOADER' | 'NRFDL_IMAGE_TYPE_SOFTDEVICE' | 'NRFDL_IMAGE_TYPE_OPERATIVE_SYSTEM' | 'NRFDL_IMAGE_TYPE_GENERIC' | 'NRFDL_IMAGE_TYPE_UNKNOWN';
interface ImageLocation {
    address: number;
    size: number;
}
interface SemanticVersion {
    major: number;
    minor: number;
    patch: number;
    pre: string;
    metadata?: string;
}
interface Image {
    imageLocation?: ImageLocation;
    imageType: ImageType;
    version: SemanticVersion | string | number;
    versionFormat: string;
}
export interface FWInfo {
    name: 'fw-read-info';
    bootloaderType: BootloaderType;
    imageInfoList: Image[];
    serialNumber: string;
    operationId?: string;
}
declare const _default: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController) => Promise<FWInfo>;
export default _default;
//# sourceMappingURL=getFwInfo.d.ts.map