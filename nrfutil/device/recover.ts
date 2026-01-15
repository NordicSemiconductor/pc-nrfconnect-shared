/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type OnProgress } from '../sandboxTypes';
import {
    coreArg,
    type DeviceCore,
    deviceSingleTaskEndOperationVoid,
    type NrfutilDevice,
} from './common';

export default (
    device: NrfutilDevice,
    core?: DeviceCore,
    onProgress?: OnProgress,
    controller?: AbortController,
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'recover',
        onProgress,
        controller,
        coreArg(core),
    );
