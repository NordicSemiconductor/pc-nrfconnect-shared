/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress } from '../sandboxTypes';
import { deviceSingleTaskEndOperation, NrfutilDevice } from './common';

export interface BoardControllerConfigResponse {
    data: {
        cfg: unknown[][];
    };
}

export default (
    device: NrfutilDevice,
    onProgress?: (progress: Progress) => void,
    controller?: AbortController
) => {
    // "operation: 0, command_id: 0" is the command to retrieve the configuration from the board controller.
    const json = {
        operations: [
            {
                operation: {
                    type: 'smp',
                    operation: 0,
                    group_id: 64,
                    command_id: 0,
                    sequence_number: 0,
                },
                operationId: '1',
            },
        ],
    };

    return deviceSingleTaskEndOperation<BoardControllerConfigResponse>(
        device,
        'x-execute-batch',
        onProgress,
        controller,
        ['--batch-json', JSON.stringify(json)]
    ).then(res => res.data?.cfg ?? []);
};
