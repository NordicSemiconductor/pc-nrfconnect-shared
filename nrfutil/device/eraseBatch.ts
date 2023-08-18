/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BatchOperationWrapper,
    Callbacks,
    convertDeviceCoreType,
    EraseOperation,
} from './batchTypes';
import { DeviceCore } from './common';

export default (
    core: DeviceCore,
    optionals?: {
        callbacks?: Callbacks;
    }
): BatchOperationWrapper<EraseOperation> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'erase',
        },
    },
    ...optionals?.callbacks,
});
