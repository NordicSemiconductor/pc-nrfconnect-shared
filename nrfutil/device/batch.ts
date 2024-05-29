/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { getModule } from '..';
import { TaskEnd } from '../sandboxTypes';
import { BatchOperationWrapper, Callbacks } from './batchTypes';
import {
    DeviceCore,
    DeviceTraits,
    deviceTraitsToArgs,
    NrfutilDevice,
    ResetKind,
} from './common';
import { DeviceBuffer } from './firmwareRead';
import { DeviceCoreInfo } from './getCoreInfo';
import { FWInfo } from './getFwInfo';
import { GetProtectionStatusResult } from './getProtectionStatus';
import {
    FirmwareType,
    ProgrammingOptions,
    programmingOptionsToArgs,
} from './program';

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
        callbacks?: Callbacks<unknown>,
        args: string[] = []
    ) {
        const getPromise = async () => {
            const box = await getModule('device');

            const batchOperation =
                await box.singleInfoOperationOptionalData<object>(
                    command,
                    undefined,
                    ['--generate'].concat(args)
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

    private enqueueCoreBasedBatchOperationObject(
        command: string,
        core: DeviceCore,
        callbacks?: Callbacks<unknown>,
        args: string[] = []
    ) {
        return this.enqueueBatchOperationObject(command, callbacks, [
            ...args,
            '--core',
            core,
        ]);
    }

    public getDeviceInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>) {
        this.enqueueCoreBasedBatchOperationObject(
            'device-info',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public erase(core: DeviceCore, callbacks?: Callbacks) {
        this.enqueueCoreBasedBatchOperationObject(
            'erase',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public updateDebugProbeFirmware(callbacks?: Callbacks) {
        this.enqueueBatchOperationObject(
            'x-update-debug-probe-firmware',
            callbacks as CallbacksUnknown
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
            })
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
            })
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
            })
        );

        return this;
    }

    public firmwareRead(core: DeviceCore, callbacks?: Callbacks<Buffer>) {
        this.enqueueCoreBasedBatchOperationObject('fw-read', core, {
            ...callbacks,
            onTaskEnd: (taskEnd: TaskEnd<DeviceBuffer>) => {
                if (taskEnd.result === 'success' && taskEnd.data) {
                    const data = Buffer.from(taskEnd.data.buffer, 'base64');
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
        } as CallbacksUnknown);

        return this;
    }

    public getCoreInfo(
        core: DeviceCore,
        callbacks?: Callbacks<DeviceCoreInfo>
    ) {
        this.enqueueCoreBasedBatchOperationObject(
            'core-info',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public getFwInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>) {
        this.enqueueCoreBasedBatchOperationObject(
            'fw-info',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public getProtectionStatus(
        core: DeviceCore,
        callbacks?: Callbacks<GetProtectionStatusResult>
    ) {
        this.enqueueCoreBasedBatchOperationObject(
            'protection-get',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public program(
        firmware: FirmwareType,
        core: DeviceCore,
        programmingOptions?: ProgrammingOptions,
        deviceTraits?: DeviceTraits,
        callbacks?: Callbacks
    ) {
        let args = [
            ...(deviceTraits ? deviceTraitsToArgs(deviceTraits) : []),
            ...programmingOptionsToArgs(programmingOptions),
        ];
        let newCallbacks = { ...callbacks };

        if (typeof firmware === 'string') {
            args = ['--firmware', firmware].concat(args);
        } else {
            const saveTemp = (): string => {
                let tempFilePath;
                do {
                    tempFilePath = path.join(
                        os.tmpdir(),
                        `${uuid()}.${firmware.type}`
                    );
                } while (fs.existsSync(tempFilePath));

                fs.writeFileSync(tempFilePath, firmware.buffer);

                return tempFilePath;
            };
            const tempFilePath = saveTemp();
            args = ['--firmware', tempFilePath].concat(args);

            newCallbacks = {
                ...callbacks,
                onTaskEnd: (taskEnd: TaskEnd<void>) => {
                    fs.unlinkSync(tempFilePath);
                    callbacks?.onTaskEnd?.(taskEnd);
                },
            } as CallbacksUnknown;
        }

        this.enqueueCoreBasedBatchOperationObject(
            'program',
            core,
            newCallbacks as CallbacksUnknown,
            args
        );

        return this;
    }

    public recover(core: DeviceCore, callbacks?: Callbacks) {
        this.enqueueCoreBasedBatchOperationObject(
            'recover',
            core,
            callbacks as CallbacksUnknown
        );

        return this;
    }

    public reset(core: DeviceCore, reset?: ResetKind, callbacks?: Callbacks) {
        this.enqueueCoreBasedBatchOperationObject(
            'reset',
            core,
            callbacks as CallbacksUnknown,
            reset ? ['--reset-kind', reset] : undefined
        );

        return this;
    }

    public collect(
        count: number,
        callback: (completedTasks: TaskEnd<unknown>[]) => void
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
        controller?: AbortController | undefined
    ): Promise<unknown[]> {
        if (!device.serialNumber) {
            throw new Error(
                `Device does not have a serial number, no device operation is possible`
            );
        }

        let currentOperationIndex = -1;
        let lastCompletedOperationIndex = -1;
        const results: TaskEnd<unknown>[] = [];
        const operations: BatchOperationWrapperUnknown[] = [];

        const promiseResults =
            await Promise.allSettled<BatchOperationWrapperUnknown>(
                this.operationBatchGeneration
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
                            task
                        );
                    }
                },
                onTaskBegin => {
                    currentOperationIndex += 1;
                    operations[currentOperationIndex].onTaskBegin?.(
                        onTaskBegin
                    );
                },
                taskEnd => {
                    results.push(taskEnd);

                    operations[currentOperationIndex].onTaskEnd?.(taskEnd);

                    this.collectOperations
                        .filter(
                            operation =>
                                operation.operationId === currentOperationIndex
                        )
                        .forEach(operation => {
                            operation.callback(
                                results.slice(
                                    results.length - operation.count,
                                    results.length
                                )
                            );
                        });

                    lastCompletedOperationIndex += 1;
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
                if (currentOperationIndex !== -1) {
                    operations[currentOperationIndex].onException?.(error);
                }
                throw error;
            }
        } catch (error) {
            if (currentOperationIndex !== lastCompletedOperationIndex) {
                operations[currentOperationIndex]?.onException?.(
                    error as Error
                );
            }
            throw error;
        }

        return results.map(result => result.data);
    }
}
