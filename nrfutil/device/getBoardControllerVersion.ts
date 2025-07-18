/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type OnProgress } from '../sandboxTypes';
import { deviceSingleTaskEndOperation, NrfutilDevice } from './common';

export interface BoardControllerVersionResponse {
    data: BoardControllerVersion;
}

export interface BoardControllerVersion {
    bc_fw_ver: string;
    device_id: string;
    major_ver: number;
    minor_ver: number;
    patch_ver: number;
    pca_num: number;
}

export default (
    device: NrfutilDevice,
    onProgress?: OnProgress,
    controller?: AbortController
) => {
    // "operation: 0, command_id: 1" is the command to retrieve version information from the board controller.
    const json = {
        operations: [
            {
                operation: {
                    type: 'smp',
                    operation: 0,
                    group_id: 64,
                    command_id: 1,
                    sequence_number: 0,
                },
                operationId: '1',
            },
        ],
    };

    return deviceSingleTaskEndOperation<BoardControllerVersionResponse>(
        device,
        'x-execute-batch',
        onProgress,
        controller,
        ['--batch-json', JSON.stringify(json)]
    ).then(res => res.data);
};
