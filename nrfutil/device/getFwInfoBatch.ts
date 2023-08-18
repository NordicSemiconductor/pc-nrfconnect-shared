/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BatchOperationWrapper,
    Callbacks,
    convertDeviceCoreType,
    GetFwInfoOperation,
} from './batchTypes';
import { DeviceCore } from './common';
import { FWInfo } from './getFwInfo';

export default (
    core: DeviceCore,
    optionals?: {
        callbacks?: Callbacks<FWInfo>;
    }
): BatchOperationWrapper<GetFwInfoOperation, FWInfo> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'fw-info',
        },
    },
    ...optionals?.callbacks,
});
