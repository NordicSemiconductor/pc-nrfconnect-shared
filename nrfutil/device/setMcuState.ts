/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import { deviceSingleTaskEndOperationVoid, NrfutilDevice } from './common';

export type McuState = 'Application' | 'Programming';

export default (
    device: NrfutilDevice,
    state: McuState,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController,
    target?: string
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'mcu-state-set',
        onProgress,
        controller,
        [state, target ? `--target=${target}` : '']
    );
