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

export interface UartWrite {
    name: 'uart-write';
    responses: string[];
}

export default (
    device: NrfutilDeviceWithSerialnumber,
    command: string,
    vCom?: number,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => {
    const args: string[] = ['-b', command, '-r'];

    if (vCom) {
        args.push('--vcom');
        args.push(vCom.toString());
    }

    return deviceSingleTaskEndOperation<UartWrite>(
        device,
        'uart-write',
        onProgress,
        controller,
        args
    );
};
