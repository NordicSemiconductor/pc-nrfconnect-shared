/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import {
    DeviceCore,
    deviceSingleTaskEndOperationVoid,
    NrfutilDevice,
} from './common';

export default (
    device: NrfutilDevice,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'recover',
        onProgress,
        controller,
        core ? ['--core', core] : []
    );
