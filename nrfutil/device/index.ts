/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export { default as NrfutilDeviceLib } from './device';

export type {
    DeviceCore,
    DeviceTraits,
    ProtectionStatus,
    SerialPort as DeviceSerialPort,
    NrfutilDevice,
} from './common';

export type { ReadResult } from './xRead';
export type { DeviceInfo } from './deviceInfo';
export type { DeviceCoreInfo } from './getCoreInfo';
export type { ImageType } from './getFwInfo';

export type { Batch as DeviceBatch } from './batch';
export type { Callbacks as BatchCallbacks } from './batchTypes';
export type { GetProtectionStatusResult } from './getProtectionStatus';
