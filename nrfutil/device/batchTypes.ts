/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { OnProgress, OnTaskBegin, OnTaskEnd } from '../sandboxTypes';
import { type DeviceCore, type ResetKind } from './common';

export interface BatchOperationWrapper<T = void> {
    operation: object;
    onProgress?: OnProgress;
    onTaskBegin?: OnTaskBegin;
    onTaskEnd?: OnTaskEnd<T>;
    onException?: (error: Error) => void;
}

export type Callbacks<T = void> = {
    onTaskBegin?: OnTaskBegin;
    onTaskEnd?: OnTaskEnd<T>;
    onProgress?: OnProgress;
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
