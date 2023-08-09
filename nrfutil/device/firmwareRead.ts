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

interface DeviceBuffer {
    serialNumber: string;
    buffer: string;
}

export default async (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => {
    const deviceBuffer = await deviceSingleTaskEndOperation<DeviceBuffer>(
        device,
        'fw-read',
        onProgress,
        controller,
        core ? ['--core', core] : []
    );

    return Buffer.from(deviceBuffer.buffer, 'base64');
};
