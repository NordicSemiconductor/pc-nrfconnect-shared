/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { SemanticVersion } from '@nordicsemiconductor/nrf-device-lib-js';

export interface HotplugEvent {
    id: number;
    event: 'NRFDL_DEVICE_EVENT_ARRIVED' | 'NRFDL_DEVICE_EVENT_LEFT';
    device?: Device;
}

export interface DeviceArrivedEvent {
    device: Device;
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

export interface Device {
    id: number;
    serialNumber?: string; // undefined in case udev is not installed
    traits: DeviceTraits;
    usb?: USB;
    jlink?: JLink;
    // non-Nordic devices may not have serialPorts property at all
    serialPorts?: Array<SerialPort>;
    hwInfo?: HwInfo;
    dfuTriggerInfo?: DfuTriggerInfo;
    dfuTriggerVersion?: DfuTriggerVersion;
    broken?: null | {
        description: string;
        url: string;
    };
}

export type ProgrammingOptions =
    | JLinkProgrammingOptions
    | McuBootProgrammingOptions
    | NordicDfuProgrammingOptions;

export interface JLinkProgrammingOptions {
    chipEraseMode: 'ERASE_ALL' | 'ERASE_NONE';
    reset:
        | 'RESET_DEBUG'
        | 'RESET_HARD'
        | 'RESET_NONE'
        | 'RESET_PIN'
        | 'RESET_SYSTEM';
    verify: 'VERIFY_HASH' | 'VERIFY_NONE' | 'VERIFY_READ';
}

export interface McuBootProgrammingOptions {
    mcuEndState: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
    net_core_upload_delay: number;
}

export interface NordicDfuProgrammingOptions {
    mcuEndState: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
}

export type BootloaderType =
    | 'NRFDL_BOOTLOADER_TYPE_NONE'
    | 'NRFDL_BOOTLOADER_TYPE_MCUBOOT'
    | 'NRFDL_BOOTLOADER_TYPE_SDFU'
    | 'NRFDL_BOOTLOADER_TYPE_B0'
    | 'NRFDL_BOOTLOADER_TYPE_UNKNOWN';

// NOTE: broken. Fix is WIP; TODO: check again
export type ImageType =
    | 'NRFDL_IMAGE_TYPE_APPLICATION'
    | 'NRFDL_IMAGE_TYPE_BOOTLOADER'
    | 'NRFDL_IMAGE_TYPE_SOFTDEVICE'
    | 'NRFDL_IMAGE_TYPE_OPERATIVE_SYSTEM'
    | 'NRFDL_IMAGE_TYPE_GENERIC'
    | 'NRFDL_IMAGE_TYPE_UNKNOWN';

export type VersionType =
    | 'NRFDL_VERSION_TYPE_SEMANTIC'
    | 'NRFDL_VERSION_TYPE_INCREMENTAL'
    | 'NRFDL_VERSION_TYPE_STRING';

interface ImageLocation {
    address: number;
    size: number;
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

export type DeviceCore =
    | 'NRFDL_DEVICE_CORE_APPLICATION'
    | 'NRFDL_DEVICE_CORE_MODEM'
    | 'NRFDL_DEVICE_CORE_NETWORK';

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
    configList: USBConfiguration; // todo: check this prop
}

export interface JLink {
    serialNumber: string;
    boardVersion: string | null; // can be null for external jLink
    jlinkObFirmwareVersion: string | null;
    deviceFamily: string | null;
    deviceVersion: string | null; // will be null if device is protected
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
