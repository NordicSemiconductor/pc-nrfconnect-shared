/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Progress, Task, TaskBegin, TaskEnd } from '../sandboxTypes';
import { DeviceCore, ResetKind } from './common';
import {
    isJLinkProgrammingOptions,
    isMcuBootProgrammingOptions,
    isNordicDfuProgrammingOptions,
    ProgrammingOptions,
} from './program';

export interface BatchOperationWrapper<OperationType, Result = void> {
    operation: GenericOperation<OperationType>;
    onProgress?: (progress: Progress, task?: Task) => void;
    onTaskBegin?: TaskBeginCallback;
    onTaskEnd?: TaskEndCallback<Result>;
    onException?: (error: Error) => void;
}

export type Callbacks<T = void> = {
    onTaskBegin?: TaskBeginCallback;
    onTaskEnd?: TaskEndCallback<T>;
    onProgress?: (progress: Progress, task?: Task) => void;
    onException?: (error: Error) => void;
};

export type DeviceCoreBatch =
    | 'NRFDL_DEVICE_CORE_APPLICATION'
    | 'NRFDL_DEVICE_CORE_NETWORK'
    | 'NRFDL_DEVICE_CORE_MODEM';

export const convertDeviceCoreType = (core?: DeviceCore) => {
    switch (core) {
        case 'Application':
            return 'NRFDL_DEVICE_CORE_APPLICATION';
        case 'Network':
            return 'NRFDL_DEVICE_CORE_NETWORK';
        case 'Modem':
            return 'NRFDL_DEVICE_CORE_MODEM';
    }
};

export const convertProgrammingOptionsType = (
    programmingOptions?: ProgrammingOptions
) => {
    if (!programmingOptions) {
        return undefined;
    }

    if (isJLinkProgrammingOptions(programmingOptions)) {
        return {
            qspi_erase_mode: programmingOptions.chipEraseMode,
            reset: programmingOptions.reset,
            verify: programmingOptions.verify,
        };
    }

    if (isMcuBootProgrammingOptions(programmingOptions)) {
        return {
            mcu_end_state: programmingOptions.mcuEndState,
            net_core_upload_delay: programmingOptions.netCoreUploadDelay,
        };
    }

    if (isNordicDfuProgrammingOptions(programmingOptions)) {
        return {
            mcu_end_state: programmingOptions.mcuEndState,
        };
    }
};

export interface ProgrammingOperation {
    type: 'program';
    firmware: {
        file: string;
    };
    reset?: ResetKind;
}

export interface ResetOperation {
    type: 'reset';
    option?: ResetKind;
}

export interface RecoverOperation {
    type: 'recover';
}

export interface ProtectionGetOperation {
    type: 'protection-get';
}

export interface FirmwareReadOperation {
    type: 'fw-read';
    firmware: {
        buffer: string;
    };
}

export interface EraseOperation {
    type: 'erase';
}

export interface GetCoreInfoOperation {
    type: 'core-info';
}

export interface GetFwInfoOperation {
    type: 'fw-info';
}

export interface GenericOperation<T> {
    core?: DeviceCoreBatch;
    operationId?: string;
    operation: T;
}

export type BatchOperation =
    | ProgrammingOperation
    | ResetOperation
    | RecoverOperation
    | ProtectionGetOperation
    | FirmwareReadOperation
    | EraseOperation
    | GetCoreInfoOperation
    | GetFwInfoOperation;

export type TaskEndCallback<T = void> = (end: TaskEnd<T>) => void;
export type TaskBeginCallback = (begin: TaskBegin) => void;
