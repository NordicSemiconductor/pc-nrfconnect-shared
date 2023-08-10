import { BatchOperationWrapper, Callbacks, ProtectionGetOperation } from './batchTypes';
import { DeviceCore } from './common';
import { GetProtectionStatusResult } from './getProtectionStatus';
declare const _default: (core: DeviceCore, optionals?: {
    callbacks?: Callbacks<GetProtectionStatusResult>;
}) => BatchOperationWrapper<ProtectionGetOperation, GetProtectionStatusResult>;
export default _default;
//# sourceMappingURL=getProtectionStatusBatch.d.ts.map