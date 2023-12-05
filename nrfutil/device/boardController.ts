/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import { deviceSingleTaskEndOperationVoid, NrfutilDevice } from './common';

export default (
    device: NrfutilDevice,
    data: object,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => {
    // "operation: 2, command_id: 0" is the command to set the configuration for the board controller.
    const json = {
        operations: [
            {
                operation: {
                    type: 'smp',
                    operation: 2,
                    group_id: 64,
                    command_id: 0,
                    sequence_number: 0,
                    data,
                },
                operationId: '1',
            },
        ],
    };

    return deviceSingleTaskEndOperationVoid(
        device,
        'x-execute-batch',
        onProgress,
        controller,
        ['--batch-json', JSON.stringify(json)]
    );
};
