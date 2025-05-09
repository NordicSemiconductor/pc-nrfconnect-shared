/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type OnProgress } from '../sandboxTypes';
import {
    coreArg,
    DeviceCore,
    deviceSingleTaskEndOperation,
    NrfutilDevice,
    ProtectionStatus,
} from './common';

export interface HwInfo {
    romSize: number;
    ramSize: number;
    romPageSize: number;
    deviceFamily: string;
    deviceVersion: string;
}

export interface JLinkDeviceInfo {
    serialNumber: string;
    boardVersion?: string;
    jlinkObFirmwareVersion: string;
    deviceFamily: string | null;
    deviceVersion?: string | null;
    protectionStatus: ProtectionStatus;
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

export interface McuStateOption {
    arguments?: {
        target: string;
    };
    description: string;
    name: string;
    type: 'Programming' | 'Application';
    value: 'NRFDL_MCU_STATE_PROGRAMMING';
}

export interface DeviceInfo {
    hwInfo?: HwInfo;
    jlink?: JLinkDeviceInfo;
    dfuTriggerVersion?: DfuTriggerVersion;
    dfuTriggerInfo?: DfuTriggerInfo;
    mcuStateOptions?: McuStateOption[];
    supportedOptions?: string[];
}

export interface DeviceInfoRaw {
    name: 'device-info';
    deviceInfo: DeviceInfo;
}

export default async (
    device: NrfutilDevice,
    core?: DeviceCore,
    onProgress?: OnProgress,
    controller?: AbortController
) => {
    try {
        return device.traits.jlink ||
            device.traits.nordicDfu ||
            device.traits.mcuBoot
            ? (
                  await deviceSingleTaskEndOperation<DeviceInfoRaw>(
                      device,
                      'device-info',
                      onProgress,
                      controller,
                      coreArg(core)
                  )
              ).deviceInfo
            : undefined;
    } catch (_) {
        return undefined;
    }
};
