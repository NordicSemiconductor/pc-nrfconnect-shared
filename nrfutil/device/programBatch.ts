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
    BatchOperationWrapper,
    Callbacks,
    convertDeviceCoreType,
    convertProgrammingOptionsType,
    ProgrammingOperation,
} from './batchTypes';
import { DeviceCore } from './common';
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
    firmware: { buffer: Buffer; type: 'hex' | 'zip' } | string,
    core: DeviceCore,
    optionals?: {
        programmingOptions?: ProgrammingOptions;
        callbacks?: Callbacks;
    }
) => {
    if (typeof firmware === 'string') {
        return program(firmware, core, optionals);
    }

    const saveTemp = (): string => {
        let tempFilePath;
        do {
            tempFilePath = path.join(os.tmpdir(), `${uuid()}.${firmware.type}`);
        } while (fs.existsSync(tempFilePath));

        fs.writeFileSync(tempFilePath, firmware.buffer);

        return tempFilePath;
    };

    const tempFilePath = saveTemp();

    return program(tempFilePath, core, optionals);
};
