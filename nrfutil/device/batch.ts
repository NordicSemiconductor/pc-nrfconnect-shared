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
import { ProgrammingOptions } from './program';
import programBatch from './programBatch';
import recoverBatch from './recoverBatch';
import resetBatch from './resetBatch';

type BatchOperationWrapperUnknown = BatchOperationWrapper<unknown, unknown>;

// named list (not queue as it will be processed at once) to highlight ordered nature of this entity
interface OperationsList {
    callback: (completedTasks: TaskEnd<unknown>[]) => void;
    operationId: number;
    count: number;
}

export class Batch {
    private operations: BatchOperationWrapperUnknown[];

    private collectOperations: OperationsList[] = [];

    constructor(operations?: BatchOperationWrapperUnknown[]) {
        this.operations = operations ?? [];
    }

    // no idea what code below does -> suggesting method extraction, so it can be described by name
    private unclearMethod<TaskEndGeneric>(
        results: TaskEnd<TaskEndGeneric>[],
        id: number
    ) {
        this.collectOperations
            .filter(operation => operation.operationId === id)
            .forEach(operation => {
                operation.callback(
                    results.slice(
                        results.length - operation.count,
                        results.length
                    )
                );
            });
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
        // would be nice to extract the type. won't we pass file sometimes instead of buffer? only "buffer"?
        firmware: { buffer: Buffer; type: 'hex' | 'zip' } | string,
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
        if (!callback || typeof count === 'undefined') {
            // handle if not passed: log use case or anything else
            // same check can be applied to the methods above if it makes sense

            return this;
        }

        this.collectOperations.push({
            callback,
            // I'm not sure if we should set operationId, as it should be global Id for the whole batch operation
            // per my understanding
            // also note that if no operations on the list value will be "-1" which might be confusing at least
            operationId: this.operations.length - 1,
            count,
        });

        return this;
    }

    // here would be nice to have an option to pass timeout (like 2/5/10min etc) and allow user to abort operation if stuck
    // otherwise we might be stuck in infinite await, right?
    // idk if TaskEndGeneric (Result) is appropriate here
    public async run<TaskEndGeneric>(
        device: NrfutilDeviceWithSerialnumber,
        controller?: AbortController | undefined
    ): Promise<unknown[]> {
        let id = 0;
        const results: TaskEnd<TaskEndGeneric>[] = [];

        const operations = {
            operations: this.operations.map((operation, index) => ({
                operationId: index.toString(),
                ...operation.operation,
            })),
        };

        const sandbox = await getDeviceSandbox();
        await sandbox.execSubcommand<TaskEndGeneric>(
            'execute-batch',
            [
                '--serial-number',
                device.serialNumber,
                '--batch-json',
                JSON.stringify(operations),
            ],
            (progress, task) => {
                if (task) {
                    this.operations[id].onProgress?.(progress, task);
                }
            },
            onTaskBegin => {
                this.operations[id].onTaskBegin?.(onTaskBegin);
            },
            taskEnd => {
                results.push(taskEnd);

                this.operations[id].onTaskEnd?.(taskEnd);

                this.unclearMethod<TaskEndGeneric>(results, id);

                // I feel like operations won't be executed one-by-one by nrfutil, but rather in a single batch
                // not sure if updating id will still call all the callbacks as should be guaranteed
                id += 1;
            },
            controller
        );

        const errors = results.filter(result => result.result === 'fail');
        if (errors.length > 0) {
            throw new Error(
                `Batch failed: ${errors
                    .map(e => `error: ${e.error}, message: ${e.message}`)
                    .join('\n')}`
            );
        }

        return results.map(result => result.data);
    }
}
