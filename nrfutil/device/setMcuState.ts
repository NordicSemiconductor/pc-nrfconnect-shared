/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import {
    deviceSingleTaskEndOperationVoid,
    NrfutilDeviceWithSerialnumber,
} from './common';

export type McuState = 'Application' | 'Programming';

export default (
    device: NrfutilDeviceWithSerialnumber,
    state: McuState,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'mcu-state-set',
        onProgress,
        controller,
        [state]
    );
