/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getModule } from '..';
import { createDisposableTempFile } from '../fs';
import { TaskEnd } from '../sandboxTypes';
import { BatchOperationWrapper, Callbacks } from './batchTypes';
import {
    coreArg,
    DeviceCore,
    DeviceTraits,
    deviceTraitsToArgs,
    NrfutilDevice,
    ResetKind,
} from './common';
import { DeviceCoreInfo } from './getCoreInfo';
import { FWInfo } from './getFwInfo';
import { GetProtectionStatusResult } from './getProtectionStatus';
import {
    Firmware,
    ProgrammingOptions,
    programmingOptionsToArgs,
} from './program';
import {
    MemoryReadRaw,
    ReadResult,
    toIntelHex,
    type XReadOptions,
    xReadOptionsToArgs,
} from './xRead';

type BatchOperationWrapperUnknown = BatchOperationWrapper<unknown>;
type CallbacksUnknown = Callbacks<unknown>;

export class Batch {
    private operationBatchGeneration: Promise<BatchOperationWrapperUnknown>[] =
        [];

    private collectOperations: {
        callback: (completedTasks: TaskEnd<unknown>[]) => void;
        operationId: number;
        count: number;
    }[] = [];

    private enqueueBatchOperationObject(
        command: string,
        core: DeviceCore,
        callbacks?: CallbacksUnknown,
        args: string[] = [],
    ) {
        const getPromise = async () => {
            const box = await getModule('device');

            const batchOperation =
                await box.singleInfoOperationOptionalData<object>(
                    command,
                    undefined,
                    ['--generate', ...coreArg(core), ...args],
                );

            return {
                operation: {
                    ...batchOperation,
                },
                ...callbacks,
            };
        };

        this.operationBatchGeneration.push(getPromise());
    }

    public getDeviceInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>) {
        this.enqueueBatchOperationObject(
            'device-info',
            core,
            callbacks as CallbacksUnknown,
        );

        return this;
    }

    public erase(core: DeviceCore, callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'erase',
            core,
            callbacks as CallbacksUnknown,
        );

        return this;
    }

    public boardController(data: object, callbacks?: Callbacks) {
        // "operation: 2, command_id: 0" is the command to set the configuration for the board controller.
        this.operationBatchGeneration.push(
            new Promise<BatchOperationWrapperUnknown>(resolve => {
                resolve({
                    operation: {
                        operation: {
                            type: 'smp',
                            operation: 2,
                            group_id: 64,
                            command_id: 0,
                            sequence_number: 0,
                            data,
                        },
                    },
                    ...callbacks,
                } as BatchOperationWrapperUnknown);
            }),
        );

        return this;
    }

    public getBoardControllerConfig(callbacks?: Callbacks) {
        // "operation: 0, command_id: 0" is the command to retrieve version information from the board controller.
        this.operationBatchGeneration.push(
            new Promise<BatchOperationWrapperUnknown>(resolve => {
                resolve({
                    operation: {
                        operation: {
                            type: 'smp',
                            operation: 0,
                            group_id: 64,
                            command_id: 0,
                            sequence_number: 0,
                        },
                    },
                    ...callbacks,
                } as BatchOperationWrapperUnknown);
            }),
        );

        return this;
    }

    public getBoardControllerVersion(callbacks?: Callbacks) {
        // "operation: 0, command_id: 1" is the command to retrieve version information from the board controller.
        this.operationBatchGeneration.push(
            new Promise<BatchOperationWrapperUnknown>(resolve => {
                resolve({
                    operation: {
                        operation: {
                            type: 'smp',
                            operation: 0,
                            group_id: 64,
                            command_id: 1,
                            sequence_number: 0,
                        },
                    },
                    ...callbacks,
                } as BatchOperationWrapperUnknown);
            }),
        );

        return this;
    }

    public xRead(
        core: DeviceCore,
        options: XReadOptions,
        callbacks?: Callbacks<ReadResult>,
    ) {
        this.enqueueBatchOperationObject(
            'x-read',
            core,
            {
                ...callbacks,
                onTaskEnd: (taskEnd: TaskEnd<MemoryReadRaw>) => {
                    if (taskEnd.result === 'success' && taskEnd.data) {
                        const data = toIntelHex(taskEnd.data.memoryData);

                        callbacks?.onTaskEnd?.({
                            ...taskEnd,
                            task: {
                                ...taskEnd.task,
                                data,
                            },
                            data,
                        });
                    } else {
                        callbacks?.onException?.(new Error('Read failed'));
                    }
                },
            } as CallbacksUnknown,
            xReadOptionsToArgs(options),
        );

        return this;
    }

    public getCoreInfo(
        core: DeviceCore,
        callbacks?: Callbacks<DeviceCoreInfo>,
    ) {
        this.enqueueBatchOperationObject(
            'core-info',
            core,
            callbacks as CallbacksUnknown,
        );

        return this;
    }

    public getFwInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>) {
        this.enqueueBatchOperationObject(
            'fw-info',
            core,
            callbacks as CallbacksUnknown,
        );

        return this;
    }

    public getProtectionStatus(
        core: DeviceCore,
        callbacks?: Callbacks<GetProtectionStatusResult>,
    ) {
        this.enqueueBatchOperationObject(
            'protection-get',
            core,
            callbacks as CallbacksUnknown,
        );

        return this;
    }

    public program(
        firmware: Firmware,
        core: DeviceCore,
        programmingOptions?: ProgrammingOptions,
        deviceTraits?: DeviceTraits,
        callbacks?: CallbacksUnknown,
    ) {
        const args = [
            ...(deviceTraits ? deviceTraitsToArgs(deviceTraits) : []),
            ...programmingOptionsToArgs(programmingOptions),
        ];
        const newCallbacks = { ...callbacks };

        if (typeof firmware === 'string') {
            args.unshift('--firmware', firmware);
        } else {
            const tempFile = createDisposableTempFile(
                firmware.buffer,
                firmware.type,
            );
            args.unshift('--firmware', tempFile.path);

            newCallbacks.onTaskEnd = (taskEnd: TaskEnd<unknown>) => {
                using _ = tempFile; // Dispose the temp file at the end of this function

                callbacks?.onTaskEnd?.(taskEnd);
            };
        }

        this.enqueueBatchOperationObject('program', core, newCallbacks, args);

        return this;
    }

    public recover(core: DeviceCore, callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'recover',
            core,
            callbacks as CallbacksUnknown,
        );

        return this;
    }

    public reset(core: DeviceCore, reset?: ResetKind, callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'reset',
            core,
            callbacks as CallbacksUnknown,
            reset ? ['--reset-kind', reset] : undefined,
        );

        return this;
    }

    public collect(
        count: number,
        callback: (completedTasks: TaskEnd<unknown>[]) => void,
    ) {
        this.collectOperations.push({
            callback,
            operationId: this.operationBatchGeneration.length - 1,
            count,
        });

        return this;
    }

    public async run(
        device: NrfutilDevice,
        controller?: AbortController | undefined,
    ): Promise<unknown[]> {
        if (!device.serialNumber) {
            throw new Error(
                `Device does not have a serial number, no device operation is possible`,
            );
        }

        if (this.operationBatchGeneration.length === 0) {
            return []; // this is an empty batch nothing to run
        }

        let currentOperationIndex = -1;
        let lastCompletedOperationIndex = -1;
        const results: TaskEnd<unknown>[] = [];
        const operations: BatchOperationWrapperUnknown[] = [];

        const promiseResults =
            await Promise.allSettled<BatchOperationWrapperUnknown>(
                this.operationBatchGeneration,
            );
        promiseResults.forEach(r => {
            if (r.status === 'rejected') {
                throw r.reason;
            }
            operations.push(r.value);
        });

        const batchOperation = {
            operations: operations.map((operation, index) => ({
                operationId: index.toString(),
                ...operation.operation,
            })),
        };

        const sandbox = await getModule('device');
        try {
            await sandbox.spawnNrfutilSubcommand<unknown>(
                'x-execute-batch',
                [
                    '--serial-number',
                    device.serialNumber,
                    '--batch-json',
                    JSON.stringify(batchOperation),
                ],
                (progress, task) => {
                    if (task && currentOperationIndex !== -1) {
                        operations[currentOperationIndex].onProgress?.(
                            progress,
                            task,
                        );
                    }
                },
                onTaskBegin => {
                    currentOperationIndex += 1;
                    operations[currentOperationIndex].onTaskBegin?.(
                        onTaskBegin,
                    );
                },
                taskEnd => {
                    results.push(taskEnd);

                    operations[currentOperationIndex].onTaskEnd?.(taskEnd);

                    this.collectOperations
                        .filter(
                            operation =>
                                operation.operationId === currentOperationIndex,
                        )
                        .forEach(operation => {
                            operation.callback(
                                results.slice(
                                    results.length - operation.count,
                                    results.length,
                                ),
                            );
                        });

                    lastCompletedOperationIndex += 1;
                },
                controller,
            );

            const errors = results.filter(result => result.result === 'fail');
            if (errors.length > 0) {
                const error = new Error(
                    `Batch failed: ${errors
                        .map(e => `error: ${e.error}, message: ${e.message}`)
                        .join('\n')}`,
                );
                if (currentOperationIndex !== -1) {
                    operations[currentOperationIndex].onException?.(error);
                }
                throw error;
            }
        } catch (error) {
            if (currentOperationIndex !== lastCompletedOperationIndex) {
                operations[currentOperationIndex]?.onException?.(
                    error as Error,
                );
            }
            throw error;
        }

        return results.map(result => result.data);
    }
}
