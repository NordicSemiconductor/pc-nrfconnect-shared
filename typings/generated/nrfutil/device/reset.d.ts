import { Progress } from '../sandboxTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber, ResetKind } from './common';
declare const _default: (device: NrfutilDeviceWithSerialnumber, core?: DeviceCore, resetKind?: ResetKind, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController) => Promise<void>;
export default _default;
//# sourceMappingURL=reset.d.ts.map