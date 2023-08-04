/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import path from 'path';

import logger from '../../logging';
import { getAppDataDir } from '../../utils/appDirs';
import {
    getIsLoggingVerbose,
    persistIsLoggingVerbose,
} from '../../utils/persistentStore';
import sandbox, { type NrfutilSandbox } from '../sandbox';
import { Progress } from '../sandboxTypes';

export const deviceTraitsToArgs = (traits: DeviceTraits) => {
    const args: string[] = [];
    const traitsString = Object.keys(traits)
        .map(trait => (traits[trait as keyof DeviceTraits] ? trait : null))
        .filter(t => t !== null)
        .join(',');

    if (traitsString.length > 0) {
        args.push('--traits');
        args.push(traitsString);
    }

    return args;
};

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

export interface NrfutilDeviceWithSerialnumber extends NrfutilDevice {
    serialNumber: string;
}

export type DeviceFamily =
    | 'NRF51_FAMILY'
    | 'NRF52_FAMILY'
    | 'NRF53_FAMILY'
    | 'NRF91_FAMILY';

export type ProtectionStatus =
    | 'NRFDL_PROTECTION_STATUS_NONE'
    | 'NRFDL_PROTECTION_STATUS_REGION0'
    | 'NRFDL_PROTECTION_STATUS_REGION0_REGION1'
    | 'NRFDL_PROTECTION_STATUS_SECURE_REGIONS'
    | 'NRFDL_PROTECTION_STATUS_ALL';

export type VersionType =
    | 'NRFDL_VERSION_TYPE_SEMANTIC'
    | 'NRFDL_VERSION_TYPE_INCREMENTAL'
    | 'NRFDL_VERSION_TYPE_STRING';

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

let deviceSandbox: NrfutilSandbox | undefined;
let promiseDeviceSandbox: Promise<NrfutilSandbox> | undefined;

export const getDeviceSandbox = async () => {
    if (deviceSandbox) {
        return deviceSandbox;
    }

    if (!promiseDeviceSandbox) {
        promiseDeviceSandbox = sandbox(
            path.join(getAppDataDir(), '../'),
            'device'
        );
        deviceSandbox = await promiseDeviceSandbox;

        deviceSandbox.onLogging(evt => {
            switch (evt.level) {
                case 'TRACE':
                    logger.verbose(evt.message);
                    break;
                case 'DEBUG':
                    logger.debug(evt.message);
                    break;
                case 'INFO':
                    logger.info(evt.message);
                    break;
                case 'WARN':
                    logger.warn(evt.message);
                    break;
                case 'ERROR':
                    logger.error(evt.message);
                    break;
                case 'CRITICAL':
                    logger.error(evt.message);
                    break;
                case 'OFF':
                default:
                    // Unreachable
                    break;
            }
        });

        deviceSandbox.setLogLevel(getIsLoggingVerbose() ? 'trace' : 'error');
        // Only the first reset after selecting "reset with verbose logging" is relevant
        persistIsLoggingVerbose(false);
    }

    const box = await promiseDeviceSandbox;
    return box;
};

export const deviceSingleTaskEndOperation = async <T = void>(
    device: NrfutilDeviceWithSerialnumber,
    command: string,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController,
    args: string[] = []
) => {
    const box = await getDeviceSandbox();
    return box.singleTaskEndOperation<T>(command, onProgress, controller, [
        ...args,
        '--serial-number',
        device.serialNumber,
    ]);
};
