/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import {
    deviceSingleTaskEndOperation,
    NrfutilDeviceWithSerialnumber,
} from './common';

type McuState = 'Application' | 'Programming';

export default (
    device: NrfutilDeviceWithSerialnumber,
    state: McuState,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperation(
        device,
        'mcu-state-set',
        onProgress,
        controller,
        [state]
    );
