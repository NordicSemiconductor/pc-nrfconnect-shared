import { Progress } from '../sandboxTypes';
import { NrfutilDeviceWithSerialnumber } from './common';
type McuState = 'Application' | 'Programming';
declare const _default: (device: NrfutilDeviceWithSerialnumber, state: McuState, onProgress?: ((progress: Progress) => void) | undefined, controller?: AbortController) => Promise<NonNullable<void>>;
export default _default;
//# sourceMappingURL=setMcuState.d.ts.map