/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { convertDeviceCoreType } from './batchHelpers';
import {
    BatchOperationWrapper,
    Callbacks,
    FirmwareReadOperation,
} from './batchTypes';
import { DeviceCore } from './common';
import { DeviceBuffer } from './firmwareRead';

export default (
    core: DeviceCore,
    optionals?: {
        callbacks?: Callbacks<Buffer>;
    }
): BatchOperationWrapper<FirmwareReadOperation, DeviceBuffer> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'fw-read',
            firmware: {
                buffer: '',
            },
        },
    },
    ...optionals?.callbacks,
    onTaskEnd: taskEnd => {
        if (taskEnd.data)
            optionals?.callbacks?.onTaskEnd?.({
                ...taskEnd,
                data: Buffer.from(taskEnd.data.buffer, 'base64'),
            });
    },
});
