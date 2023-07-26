import { DependencyList } from 'react';
import { Shortcut } from '../About/shortcutSlice';
declare const useNewHotKey: (shortcut: Shortcut, deps?: DependencyList) => void;
declare const useLegacyHotKey: (hotKey: string | string[], action: () => void) => void;
declare const _default: (...args: Parameters<typeof useNewHotKey> | Parameters<typeof useLegacyHotKey>) => void;
export default _default;
//# sourceMappingURL=useHotKey.d.ts.map