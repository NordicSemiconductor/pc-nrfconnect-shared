/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type OnProgress } from '../sandboxTypes';
import {
    DeviceCore,
    deviceSingleTaskEndOperation,
    NrfutilDevice,
} from './common';

type BootloaderType =
    | 'NRFDL_BOOTLOADER_TYPE_NONE'
    | 'NRFDL_BOOTLOADER_TYPE_MCUBOOT'
    | 'NRFDL_BOOTLOADER_TYPE_SDFU'
    | 'NRFDL_BOOTLOADER_TYPE_B0'
    | 'NRFDL_BOOTLOADER_TYPE_UNKNOWN';

export type ImageType =
    | 'NRFDL_IMAGE_TYPE_APPLICATION'
    | 'NRFDL_IMAGE_TYPE_BOOTLOADER'
    | 'NRFDL_IMAGE_TYPE_SOFTDEVICE'
    | 'NRFDL_IMAGE_TYPE_OPERATIVE_SYSTEM'
    | 'NRFDL_IMAGE_TYPE_GENERIC'
    | 'NRFDL_IMAGE_TYPE_UNKNOWN';

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

export default (
    device: NrfutilDevice,
    core?: DeviceCore,
    onProgress?: OnProgress,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperation<FWInfo>(
        device,
        'fw-info',
        onProgress,
        controller,
        core ? ['--core', core] : []
    );
