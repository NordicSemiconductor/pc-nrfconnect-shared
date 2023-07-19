export interface HotplugEvent {
    id: number;
    event: 'Arrived' | 'Left';
    device?: NrfutilDevice;
}
export interface ListEvent {
    devices: NrfutilDevice[];
}
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
export type McuState = 'Application' | 'Programming';
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
export interface DeviceBuffer {
    serialNumber: string;
    buffer: string;
}
export type ProgrammingOptions = JLinkProgrammingOptions | McuBootProgrammingOptions | NordicDfuProgrammingOptions;
export type DeviceFamily = 'NRF51_FAMILY' | 'NRF52_FAMILY' | 'NRF53_FAMILY' | 'NRF91_FAMILY';
export type ProtectionStatus = 'NRFDL_PROTECTION_STATUS_NONE' | 'NRFDL_PROTECTION_STATUS_REGION0' | 'NRFDL_PROTECTION_STATUS_REGION0_REGION1' | 'NRFDL_PROTECTION_STATUS_SECURE_REGIONS' | 'NRFDL_PROTECTION_STATUS_ALL';
export interface GetProtectionStatusResult {
    core: DeviceCore;
    deviceFamily?: DeviceFamily;
    protectionStatus: ProtectionStatus;
    serialNumber: string;
}
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
export interface JLinkProgrammingOptions {
    chipEraseMode?: 'ERASE_ALL' | 'ERASE_NONE';
    reset?: 'RESET_DEBUG' | 'RESET_HARD' | 'RESET_NONE' | 'RESET_PIN' | 'RESET_SYSTEM';
    verify?: 'VERIFY_HASH' | 'VERIFY_NONE' | 'VERIFY_READ';
}
export interface McuBootProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
    netCoreUploadDelay?: number;
}
export interface NordicDfuProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
}
export type BootloaderType = 'NRFDL_BOOTLOADER_TYPE_NONE' | 'NRFDL_BOOTLOADER_TYPE_MCUBOOT' | 'NRFDL_BOOTLOADER_TYPE_SDFU' | 'NRFDL_BOOTLOADER_TYPE_B0' | 'NRFDL_BOOTLOADER_TYPE_UNKNOWN';
export type ImageType = 'NRFDL_IMAGE_TYPE_APPLICATION' | 'NRFDL_IMAGE_TYPE_BOOTLOADER' | 'NRFDL_IMAGE_TYPE_SOFTDEVICE' | 'NRFDL_IMAGE_TYPE_OPERATIVE_SYSTEM' | 'NRFDL_IMAGE_TYPE_GENERIC' | 'NRFDL_IMAGE_TYPE_UNKNOWN';
export type VersionType = 'NRFDL_VERSION_TYPE_SEMANTIC' | 'NRFDL_VERSION_TYPE_INCREMENTAL' | 'NRFDL_VERSION_TYPE_STRING';
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
export {};
