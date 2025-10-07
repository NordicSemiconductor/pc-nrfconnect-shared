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
} from './common';

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

export default (
    device: NrfutilDevice,
    core?: DeviceCore,
    onProgress?: OnProgress,
    controller?: AbortController,
) =>
    deviceSingleTaskEndOperation<DeviceCoreInfo>(
        device,
        'core-info',
        onProgress,
        controller,
        coreArg(core),
    );
