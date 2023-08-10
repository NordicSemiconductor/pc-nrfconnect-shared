/// <reference types="node" />
import { BatchOperationWrapper, Callbacks, FirmwareReadOperation } from './batchTypes';
import { DeviceCore } from './common';
import { DeviceBuffer } from './firmwareRead';
declare const _default: (core: DeviceCore, optionals?: {
    callbacks?: Callbacks<Buffer>;
}) => BatchOperationWrapper<FirmwareReadOperation, DeviceBuffer>;
export default _default;
//# sourceMappingURL=firmwareReadBatch.d.ts.map