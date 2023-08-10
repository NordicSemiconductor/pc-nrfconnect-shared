import { BatchOperationWrapper, Callbacks, GetCoreInfoOperation } from './batchTypes';
import { DeviceCore } from './common';
import { DeviceCoreInfo } from './getCoreInfo';
declare const _default: (core: DeviceCore, optionals?: {
    callbacks?: Callbacks<DeviceCoreInfo>;
}) => BatchOperationWrapper<GetCoreInfoOperation, DeviceCoreInfo>;
export default _default;
//# sourceMappingURL=getCoreInfoBatch.d.ts.map