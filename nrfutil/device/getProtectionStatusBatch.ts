/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BatchOperationWrapper,
    Callbacks,
    convertDeviceCoreType,
    ProtectionGetOperation,
} from './batchTypes';
import { DeviceCore } from './common';
import { GetProtectionStatusResult } from './getProtectionStatus';

export default (
    core: DeviceCore,
    optionals?: {
        callbacks?: Callbacks<GetProtectionStatusResult>;
    }
): BatchOperationWrapper<
    ProtectionGetOperation,
    GetProtectionStatusResult
> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'protection-get',
        },
    },
    ...optionals?.callbacks,
});
