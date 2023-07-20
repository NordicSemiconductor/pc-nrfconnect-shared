import { type NrfutilSandbox } from '../sandbox';
import { Progress } from '../sandboxTypes';
export declare const deviceTraitsToArgs: (traits: DeviceTraits) => string[];
export interface DeviceArrivedEvent {
    device: NrfutilDevice;
}
export interface DeviceLeftEvent {
    id: number;
}
export interface HwInfo {
    romSize: number;
    ramSize: number;
    romPageSize: number;
    deviceFamily: string;
    deviceVersion: string;
}
export interface DfuTriggerInfo {
    wAddress: number;
    wVersionMajor: number;
    wVersionMinor: number;
    wFirmwareId: number;
    wFlashSize: number;
    wFlashPageSize: number;
}
export interface DfuTriggerVersion {
    semVer: string;
}
export interface NrfutilDevice {
    id: number;
    serialNumber?: string;
    traits: DeviceTraits;
    usb?: USB;
    jlink?: JLink;
    serialPorts?: Array<SerialPort>;
    hwInfo?: HwInfo;
    dfuTriggerInfo?: DfuTriggerInfo;
    dfuTriggerVersion?: DfuTriggerVersion;
    broken?: null | {
        description: string;
        url: string;
    };
}
export interface NrfutilDeviceWithSerialnumber extends NrfutilDevice {
    serialNumber: string;
}
export type DeviceFamily = 'NRF51_FAMILY' | 'NRF52_FAMILY' | 'NRF53_FAMILY' | 'NRF91_FAMILY';
export type ProtectionStatus = 'NRFDL_PROTECTION_STATUS_NONE' | 'NRFDL_PROTECTION_STATUS_REGION0' | 'NRFDL_PROTECTION_STATUS_REGION0_REGION1' | 'NRFDL_PROTECTION_STATUS_SECURE_REGIONS' | 'NRFDL_PROTECTION_STATUS_ALL';
export type VersionType = 'NRFDL_VERSION_TYPE_SEMANTIC' | 'NRFDL_VERSION_TYPE_INCREMENTAL' | 'NRFDL_VERSION_TYPE_STRING';
export type DeviceCore = 'Application' | 'Modem' | 'Network';
export interface DeviceTraits {
    usb?: boolean;
    nordicUsb?: boolean;
    nordicDfu?: boolean;
    seggerUsb?: boolean;
    jlink?: boolean;
    serialPorts?: boolean;
    broken?: boolean;
    mcuBoot?: boolean;
    modem?: boolean;
}
export interface USB {
    serialNumber: string;
    manufacturer: string | null;
    osDevicePath: string;
    product: string | null;
    device: USBDevice;
}
export interface USBDeviceDescriptor {
    bDescriptorType: number;
    idVendor: number;
    idProduct: number;
    bcdDevice: number;
}
export interface USBConfigurationDescriptor {
    bDescriptorType: number;
}
export interface USBInterfaceDescriptor {
    bDescriptorType: number;
    bInterfaceClass: number;
    bInterfaceSubClass: number;
    bInterfaceProtocol: number;
}
export interface USBInterface {
    descriptors: USBInterfaceDescriptor[];
    endpointLists: USBEndpoint[];
}
export interface USBEndpointDescriptor {
    bDescriptorType: number;
}
export interface USBEndpoint {
    descriptors?: USBEndpointDescriptor[];
    length: number;
}
export interface USBConfiguration {
    descriptors: USBConfigurationDescriptor[];
    interfaceLists: USBInterface[];
    length: number;
}
export interface USBDevice {
    busNumber: number;
    address: number;
    descriptor: USBDeviceDescriptor;
    configList: USBConfiguration;
}
export interface JLink {
    serialNumber: string;
    boardVersion: string | null;
    jlinkObFirmwareVersion: string | null;
    deviceFamily: string | null;
    deviceVersion: string | null;
}
export interface SerialPort {
    serialNumber: string | null;
    comName: string | null;
    manufacturer: string | null;
    productId: string | null;
    vendorId: string | null;
    vcom: number;
    path: string | null;
}
export declare const getDeviceSandbox: () => Promise<NrfutilSandbox>;
export declare const deviceSingleTaskEndOperation: <T = void>(device: NrfutilDeviceWithSerialnumber, command: string, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController, args?: string[]) => Promise<NonNullable<T>>;
//# sourceMappingURL=common.d.ts.map