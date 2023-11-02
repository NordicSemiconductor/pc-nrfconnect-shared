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
    ResetKind,
} from './common';

export default async (
    device: NrfutilDevice,
    core?: DeviceCore,
    resetKind?: ResetKind,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => {
    const args: string[] = [];

    if (resetKind) {
        args.push('--reset-kind');
        args.push(resetKind);
    }

    if (core) {
        args.push('--core');
        args.push(core);
    }

    await deviceSingleTaskEndOperationVoid(
        device,
        'reset',
        onProgress,
        controller,
        args
    );
};
