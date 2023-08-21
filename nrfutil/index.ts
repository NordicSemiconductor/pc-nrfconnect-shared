/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export { default as NrfutilDeviceLib } from './device/device';

export type {
    DeviceCore,
    DeviceTraits,
    ProtectionStatus,
    SerialPort as DeviceSerialPort,
    NrfutilDevice,
} from './device/common';

export type { DeviceCoreInfo } from './device/getCoreInfo';
export type { ImageType } from './device/getFwInfo';

export { default as prepareSandbox } from './sandbox';
export { NrfutilSandbox } from './sandbox';
export type { Progress, SemanticVersion } from './sandboxTypes';
export type { Batch as DeviceBatch } from './device/batch';
export type { Callbacks as BatchCallbacks } from './device/batchTypes';
export type { GetProtectionStatusResult } from './device/getProtectionStatus';
