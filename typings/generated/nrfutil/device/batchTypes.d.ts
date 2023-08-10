import { Progress, Task, TaskBegin, TaskEnd } from '../sandboxTypes';
import { DeviceCore, ResetKind } from './common';
import { ProgrammingOptions } from './program';
export interface BatchOperationWrapper<OperationType, T = void> {
    operation: GenericOperation<OperationType>;
    onProgress?: (progress: Progress, task?: Task) => void;
    onTaskBegin?: TaskBeginCallback;
    onTaskEnd?: TaskEndCallback<T>;
}
export type Callbacks<T = void> = {
    onTaskBegin?: TaskBeginCallback;
    onTaskEnd?: TaskEndCallback<T>;
    onProgress?: (progress: Progress, task?: Task) => void;
};
export type DeviceCoreBatch = 'NRFDL_DEVICE_CORE_APPLICATION' | 'NRFDL_DEVICE_CORE_NETWORK' | 'NRFDL_DEVICE_CORE_MODEM';
export declare const convertDeviceCoreType: (core?: DeviceCore) => "NRFDL_DEVICE_CORE_APPLICATION" | "NRFDL_DEVICE_CORE_NETWORK" | "NRFDL_DEVICE_CORE_MODEM" | undefined;
export declare const convertProgrammingOptionsType: (programmingOptions?: ProgrammingOptions) => {
    qspi_erase_mode: "ERASE_ALL" | "ERASE_NONE" | undefined;
    reset: ResetKind | undefined;
    verify: "VERIFY_HASH" | "VERIFY_NONE" | "VERIFY_READ" | undefined;
    mcu_end_state?: undefined;
    net_core_upload_delay?: undefined;
} | {
    mcu_end_state: "NRFDL_MCU_STATE_APPLICATION" | "NRFDL_MCU_STATE_PROGRAMMING" | undefined;
    net_core_upload_delay: number | undefined;
    qspi_erase_mode?: undefined;
    reset?: undefined;
    verify?: undefined;
} | {
    mcu_end_state: "NRFDL_MCU_STATE_APPLICATION" | "NRFDL_MCU_STATE_PROGRAMMING" | undefined;
    qspi_erase_mode?: undefined;
    reset?: undefined;
    verify?: undefined;
    net_core_upload_delay?: undefined;
} | undefined;
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
export type BatchOperation = ProgrammingOperation | ResetOperation | RecoverOperation | ProtectionGetOperation | FirmwareReadOperation | EraseOperation | GetCoreInfoOperation | GetFwInfoOperation;
export type TaskEndCallback<T = void> = (end: TaskEnd<T>) => void;
export type TaskBeginCallback = (begin: TaskBegin) => void;
//# sourceMappingURL=batchTypes.d.ts.map