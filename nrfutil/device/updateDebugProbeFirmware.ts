/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import { deviceSingleTaskEndOperationVoid, NrfutilDevice } from './common';

export default (
    device: NrfutilDevice,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'x-update-debug-probe-firmware',
        onProgress,
        controller
    );
