/// <reference types="node" />
import { Progress } from '../sandboxTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber } from './common';
declare const _default: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController) => Promise<Buffer>;
export default _default;
//# sourceMappingURL=firmwareRead.d.ts.map