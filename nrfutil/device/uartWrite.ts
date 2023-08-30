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

export default async (
    device: NrfutilDeviceWithSerialnumber,
    command: string,
    vCom?: number,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => {
    const args: string[] = ['-b', command];

    if (vCom) {
        args.push('--vcom');
        args.push(vCom.toString());
    }

    await deviceSingleTaskEndOperation<string>(
        device,
        'uart-write',
        onProgress,
        controller,
        args
    );
};
