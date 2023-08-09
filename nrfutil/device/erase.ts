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

export default (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperation(
        device,
        'erase',
        onProgress,
        controller,
        core ? ['--core', core] : []
    );
