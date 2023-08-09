/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import {
    DeviceCore,
    deviceSingleTaskEndOperation,
    NrfutilDeviceWithSerialnumber,
} from './common';

type DeviceFamily =
    | 'NRF51_FAMILY'
    | 'NRF52_FAMILY'
    | 'NRF53_FAMILY'
    | 'NRF91_FAMILY';

type ProtectionStatus =
    | 'NRFDL_PROTECTION_STATUS_NONE'
    | 'NRFDL_PROTECTION_STATUS_REGION0'
    | 'NRFDL_PROTECTION_STATUS_REGION0_REGION1'
    | 'NRFDL_PROTECTION_STATUS_SECURE_REGIONS'
    | 'NRFDL_PROTECTION_STATUS_ALL';

export interface GetProtectionStatusResult {
    core: DeviceCore;
    deviceFamily?: DeviceFamily;
    protectionStatus: ProtectionStatus;
    serialNumber: string;
}

export default (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperation<GetProtectionStatusResult>(
        device,
        'protection-get',
        onProgress,
        controller,
        core ? ['--core', core] : []
    );
