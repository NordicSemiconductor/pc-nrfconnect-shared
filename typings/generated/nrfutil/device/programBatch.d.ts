/// <reference types="node" />
import { BatchOperationWrapper, Callbacks, ProgrammingOperation } from './batchTypes';
import { DeviceCore } from './common';
import { ProgrammingOptions } from './program';
declare const _default: (firmware: {
    buffer: Buffer;
    type: 'hex' | 'zip';
} | string, core: DeviceCore, optionals?: {
    programmingOptions?: ProgrammingOptions;
    callbacks?: Callbacks;
}) => BatchOperationWrapper<ProgrammingOperation, void>;
export default _default;
//# sourceMappingURL=programBatch.d.ts.map