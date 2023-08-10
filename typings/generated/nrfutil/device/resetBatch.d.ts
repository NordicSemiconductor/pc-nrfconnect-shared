import { BatchOperationWrapper, Callbacks, ResetOperation } from './batchTypes';
import { DeviceCore, ResetKind } from './common';
declare const _default: (core?: DeviceCore, optionals?: {
    reset?: ResetKind;
    callbacks?: Callbacks;
}) => BatchOperationWrapper<ResetOperation>;
export default _default;
//# sourceMappingURL=resetBatch.d.ts.map