import { Progress } from '../sandboxTypes';
import { DeviceCore, NrfutilDeviceWithSerialnumber } from './common';
declare const _default: (device: NrfutilDeviceWithSerialnumber, region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1', core?: DeviceCore, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController) => Promise<NonNullable<void>>;
export default _default;
//# sourceMappingURL=setProtectionStatus.d.ts.map