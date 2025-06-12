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
    ResetKind,
} from './common';

export default async (
    device: NrfutilDevice,
    core?: DeviceCore,
    resetKind?: ResetKind,
    onProgress?: OnProgress,
    controller?: AbortController
) => {
    const args: string[] = [];

    if (resetKind) {
        args.push('--reset-kind');
        args.push(resetKind);
    }

    if (core) {
        args.push(...coreArg(core));
    }

    await deviceSingleTaskEndOperationVoid(
        device,
        'reset',
        onProgress,
        controller,
        args
    );
};
