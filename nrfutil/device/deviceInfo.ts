/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import {
    DeviceCore,
    deviceSingleTaskEndOperation,
    NrfutilDevice,
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

export interface DeviceInfo {
    hwInfo?: HwInfo;
    jlink?: JLinkDeviceInfo;
    dfuTriggerVersion?: DfuTriggerVersion;
    dfuTriggerInfo?: DfuTriggerInfo;
}

export interface DeviceInfoRaw {
    name: 'device-info';
    deviceInfo: DeviceInfo;
}

export default async (
    device: NrfutilDevice,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    device.traits.jlink || device.traits.nordicDfu
        ? (
              await deviceSingleTaskEndOperation<DeviceInfoRaw>(
                  device,
                  'device-info',
                  onProgress,
                  controller,
                  core ? ['--core', core] : []
              )
          ).deviceInfo
        : undefined;
