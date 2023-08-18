/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TaskEnd } from '../sandboxTypes';
import { BatchOperationWrapper, Callbacks } from './batchTypes';
import {
    DeviceCore,
    getDeviceSandbox,
    NrfutilDeviceWithSerialnumber,
    ResetKind,
} from './common';
import eraseBatch from './eraseBatch';
import firmwareReadBatch from './firmwareReadBatch';
import { DeviceCoreInfo } from './getCoreInfo';
import getCoreInfoBatch from './getCoreInfoBatch';
import { FWInfo } from './getFwInfo';
import getFwInfoBatch from './getFwInfoBatch';
import { GetProtectionStatusResult } from './getProtectionStatus';
import getProtectionStatusBatch from './getProtectionStatusBatch';
import { FirmwareType, ProgrammingOptions } from './program';
import programBatch from './programBatch';
import recoverBatch from './recoverBatch';
import resetBatch from './resetBatch';

type BatchOperationWrapperUnknown = BatchOperationWrapper<unknown, unknown>;

export class Batch {
    private operations: BatchOperationWrapperUnknown[];

    private collectOperations: {
        callback: (completedTasks: TaskEnd<unknown>[]) => void;
        operationId: number;
        count: number;
    }[] = [];

    constructor(operations?: BatchOperationWrapperUnknown[]) {
        this.operations = operations ?? [];
    }

    public erase(core: DeviceCore, callbacks?: Callbacks) {
        this.operations.push(
            eraseBatch(core, { callbacks }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public firmwareRead(core: DeviceCore, callbacks?: Callbacks<Buffer>) {
        this.operations.push(
            firmwareReadBatch(core, {
                callbacks,
            }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public getCoreInfo(
        core: DeviceCore,
        callbacks?: Callbacks<DeviceCoreInfo>
    ) {
        this.operations.push(
            getCoreInfoBatch(core, {
                callbacks,
            }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public getFwInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>) {
        this.operations.push(
            getFwInfoBatch(core, {
                callbacks,
            }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public getProtectionStatus(
        core: DeviceCore,
        callbacks?: Callbacks<GetProtectionStatusResult>
    ) {
        this.operations.push(
            getProtectionStatusBatch(core, {
                callbacks,
            }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public program(
        firmware: FirmwareType,
        core: DeviceCore,
        programmingOptions?: ProgrammingOptions,
        callbacks?: Callbacks
    ) {
        this.operations.push(
            programBatch(firmware, core, {
                programmingOptions,
                callbacks,
            }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public recover(core: DeviceCore, callbacks?: Callbacks) {
        this.operations.push(
            recoverBatch(core, { callbacks }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public reset(core: DeviceCore, reset?: ResetKind, callbacks?: Callbacks) {
        this.operations.push(
            resetBatch(core, {
                reset,
                callbacks,
            }) as BatchOperationWrapperUnknown
        );

        return this;
    }

    public collect(
        count: number,
        callback: (completedTasks: TaskEnd<unknown>[]) => void
    ) {
        this.collectOperations.push({
            callback,
            operationId: this.operations.length - 1,
            count,
        });

        return this;
    }

    public async run(
        device: NrfutilDeviceWithSerialnumber,
        controller?: AbortController | undefined
    ): Promise<unknown[]> {
        let beginId = 0;
        let endId = 0;
        const results: TaskEnd<unknown>[] = [];

        const operations = {
            operations: this.operations.map((operation, index) => ({
                operationId: index.toString(),
                ...operation.operation,
            })),
        };

        const sandbox = await getDeviceSandbox();
        try {
            await sandbox.execSubcommand<unknown>(
                'execute-batch',
                [
                    '--serial-number',
                    device.serialNumber,
                    '--batch-json',
                    JSON.stringify(operations),
                ],
                (progress, task) => {
                    if (task) {
                        this.operations[endId].onProgress?.(progress, task);
                    }
                },
                onTaskBegin => {
                    beginId += 1;
                    this.operations[endId].onTaskBegin?.(onTaskBegin);
                },
                taskEnd => {
                    results.push(taskEnd);

                    this.operations[endId].onTaskEnd?.(taskEnd);

                    this.collectOperations
                        .filter(operation => operation.operationId === endId)
                        .forEach(operation => {
                            operation.callback(
                                results.slice(
                                    results.length - operation.count,
                                    results.length
                                )
                            );
                        });

                    endId += 1;
                },
                controller
            );

            const errors = results.filter(result => result.result === 'fail');
            if (errors.length > 0) {
                const error = new Error(
                    `Batch failed: ${errors
                        .map(e => `error: ${e.error}, message: ${e.message}`)
                        .join('\n')}`
                );
                this.operations[endId].onException?.(error);
                throw error;
            }
        } catch (error) {
            if (beginId !== endId) {
                this.operations[beginId].onException?.(error as Error);
            }
            throw error;
        }

        return results.map(result => result.data);
    }
}
