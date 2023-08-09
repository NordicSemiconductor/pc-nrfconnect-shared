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

export default (
    device: NrfutilDeviceWithSerialnumber,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => deviceSingleTaskEndOperationVoid(device, 'reset', onProgress, controller);
