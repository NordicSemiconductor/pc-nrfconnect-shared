/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getUserDataDir } from '../../src/utils/appDirs';
import {
    getIsLoggingVerbose,
    persistIsLoggingVerbose,
} from '../../src/utils/persistentStore';
import { getNrfutilLogger } from '../nrfutilLogger';
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

export type ResetKind =
    | 'RESET_SYSTEM'
    | 'RESET_HARD'
    | 'RESET_DEBUG'
    | 'RESET_PIN';

export interface DeviceArrivedEvent {
    device: NrfutilDevice;
}

export interface DeviceLeftEvent {
    id: number;
}

export interface NordicDevKit {
    boardVersion?: string;
    deviceFamily?: string;
}

export interface NrfutilDevice {
    id: number;
    devkit?: NordicDevKit;
    serialNumber?: string; // undefined in case udev is not installed
    traits: DeviceTraits;
    usb?: USB;
    // non-Nordic devices may not have serialPorts property at all
    serialPorts?: Array<SerialPort>;
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
            getUserDataDir(),
            'device',
            undefined,
            undefined
        );
        deviceSandbox = await promiseDeviceSandbox;

        deviceSandbox.onLogging(evt => {
            const deviceLogger = getNrfutilLogger();
            switch (evt.level) {
                case 'TRACE':
                    deviceLogger?.verbose(evt.message);
                    break;
                case 'DEBUG':
                    deviceLogger?.debug(evt.message);
                    break;
                case 'INFO':
                    deviceLogger?.info(evt.message);
                    break;
                case 'WARN':
                    deviceLogger?.warn(evt.message);
                    break;
                case 'ERROR':
                    deviceLogger?.error(evt.message);
                    break;
                case 'CRITICAL':
                    deviceLogger?.error(evt.message);
                    break;
                case 'OFF':
                default:
                    // Unreachable
                    break;
            }
        });

        const fallbackLevel =
            process.env.NODE_ENV === 'production' ? 'off' : 'error';
        deviceSandbox.setLogLevel(
            getIsLoggingVerbose() ? 'trace' : fallbackLevel
        );
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
    return box.singleTaskEndOperationWithData<T>(
        command,
        onProgress,
        controller,
        [...args, '--serial-number', device.serialNumber]
    );
};

export const deviceSingleTaskEndOperationVoid = async (
    device: NrfutilDeviceWithSerialnumber,
    command: string,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController,
    args: string[] = []
) => {
    const box = await getDeviceSandbox();
    await box.singleTaskEndOperationOptionalData(
        command,
        onProgress,
        controller,
        [...args, '--serial-number', device.serialNumber]
    );
};
