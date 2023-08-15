/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import {
    convertDeviceCoreType,
    convertProgrammingOptionsType,
} from './batchHelpers';
import {
    BatchOperationWrapper,
    Callbacks,
    ProgrammingOperation,
} from './batchTypes';
import { DeviceCore, FileExtensions } from './common';
import { saveTempFile } from './helpers';
import { ProgrammingOptions } from './program';

const program = (
    firmware: string,
    core: DeviceCore,
    optionals?: {
        programmingOptions?: ProgrammingOptions;
        callbacks?: Callbacks;
    }
): BatchOperationWrapper<ProgrammingOperation> => ({
    operation: {
        core: convertDeviceCoreType(core),
        operation: {
            type: 'program',
            firmware: {
                file: firmware,
            },
            ...convertProgrammingOptionsType(optionals?.programmingOptions),
        },
    },
    ...optionals?.callbacks,
});

export default (
    firmware: { buffer: Buffer; type: FileExtensions } | string,
    core: DeviceCore,
    optionals?: {
        programmingOptions?: ProgrammingOptions;
        callbacks?: Callbacks;
    }
) => {
    if (typeof firmware === 'string') {
        return program(firmware, core, optionals);
    }

    const tempFilePath = saveTempFile(firmware.buffer, firmware.type);

    return program(tempFilePath, core, optionals);
};
