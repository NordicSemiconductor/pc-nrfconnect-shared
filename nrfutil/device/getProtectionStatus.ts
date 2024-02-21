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
    ProtectionStatus,
} from './common';

type DeviceFamily =
    | 'NRF51_FAMILY'
    | 'NRF52_FAMILY'
    | 'NRF53_FAMILY'
    | 'NRF91_FAMILY';

export interface GetProtectionStatusResult {
    core: DeviceCore;
    deviceFamily?: DeviceFamily;
    protectionStatus: ProtectionStatus;
    serialNumber: string;
}

export default (
    device: NrfutilDevice,
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
