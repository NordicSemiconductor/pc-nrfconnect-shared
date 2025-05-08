/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type OnProgress } from '../sandboxTypes';
import {
    coreArg,
    DeviceCore,
    deviceSingleTaskEndOperationVoid,
    NrfutilDevice,
} from './common';

export default (
    device: NrfutilDevice,
    region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1',
    core?: DeviceCore,
    onProgress?: OnProgress,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'protection-set',
        onProgress,
        controller,
        [region, ...coreArg(core)]
    );
