/// <reference types="node" />
import { TaskEnd } from '../sandboxTypes';
import { BatchOperationWrapper, Callbacks } from './batchTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber, ResetKind } from './common';
import { DeviceCoreInfo } from './getCoreInfo';
import { FWInfo } from './getFwInfo';
import { GetProtectionStatusResult } from './getProtectionStatus';
import { ProgrammingOptions } from './program';
type BatchOperationWrapperUnknown = BatchOperationWrapper<unknown, unknown>;
export declare class Batch {
    private operations;
    private collectOperations;
    constructor(operations?: BatchOperationWrapperUnknown[]);
    erase(core: DeviceCore, callbacks?: Callbacks): this;
    firmwareRead(core: DeviceCore, callbacks?: Callbacks<Buffer>): this;
    getCoreInfo(core: DeviceCore, callbacks?: Callbacks<DeviceCoreInfo>): this;
    getFwInfo(core: DeviceCore, callbacks?: Callbacks<FWInfo>): this;
    getProtectionStatus(core: DeviceCore, callbacks?: Callbacks<GetProtectionStatusResult>): this;
    program(firmware: {
        buffer: Buffer;
        type: 'hex' | 'zip';
    } | string, core: DeviceCore, programmingOptions?: ProgrammingOptions, callbacks?: Callbacks): this;
    recover(core: DeviceCore, callbacks?: Callbacks): this;
    reset(core: DeviceCore, reset?: ResetKind, callbacks?: Callbacks): this;
    collect(count: number, callback: (completedTasks: TaskEnd<unknown>[]) => void): this;
    run(device: NrfutilDeviceWithSerialnumber, controller?: AbortController | undefined): Promise<unknown[]>;
}
export {};
//# sourceMappingURL=batch.d.ts.map