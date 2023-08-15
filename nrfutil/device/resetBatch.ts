/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { convertDeviceCoreType } from './batchHelpers';
import { BatchOperationWrapper, Callbacks, ResetOperation } from './batchTypes';
import { DeviceCore, ResetKind } from './common';

export default (
    core?: DeviceCore,
    optionals?: {
        reset?: ResetKind;
        callbacks?: Callbacks;
    }
): BatchOperationWrapper<ResetOperation> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'reset',
            option: optionals?.reset,
        },
    },
    ...optionals?.callbacks,
});
