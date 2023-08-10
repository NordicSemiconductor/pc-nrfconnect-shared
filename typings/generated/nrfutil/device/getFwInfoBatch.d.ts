import { BatchOperationWrapper, Callbacks, GetFwInfoOperation } from './batchTypes';
import { DeviceCore } from './common';
import { FWInfo } from './getFwInfo';
declare const _default: (core: DeviceCore, optionals?: {
    callbacks?: Callbacks<FWInfo>;
}) => BatchOperationWrapper<GetFwInfoOperation, FWInfo>;
export default _default;
//# sourceMappingURL=getFwInfoBatch.d.ts.map