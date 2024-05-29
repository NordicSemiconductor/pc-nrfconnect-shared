/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import { deviceSingleTaskEndOperation, NrfutilDevice } from './common';

export interface DebugProgUpdateInfo {
    name: 'update-debug-probe-firmware';
    versionAfterUpdate: string;
    versionBeforeUpdate: string;
}

export default (
    device: NrfutilDevice,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperation<DebugProgUpdateInfo>(
        device,
        'x-update-debug-probe-firmware',
        onProgress,
        controller
    );
