/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    BatchOperationWrapper,
    Callbacks,
    GetCoreInfoOperation,
} from './batchTypes';
import { DeviceCore } from './common';
import { DeviceCoreInfo } from './getCoreInfo';
import {convertDeviceCoreType} from "./batchHelpers";

export default (
    core: DeviceCore,
    optionals?: {
        callbacks?: Callbacks<DeviceCoreInfo>;
    }
): BatchOperationWrapper<GetCoreInfoOperation, DeviceCoreInfo> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'core-info',
        },
    },
    ...optionals?.callbacks,
});
