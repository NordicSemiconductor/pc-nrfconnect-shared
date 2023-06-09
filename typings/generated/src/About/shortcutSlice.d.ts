import type { RootState } from '../store';
export interface Shortcut {
    hotKey: string[] | string;
    title: string;
    isGlobal: boolean;
    action: () => void;
}
export type ShortcutState = Set<Shortcut>;
export declare const reducer: import("redux").Reducer<ShortcutState, import("redux").AnyAction>, addShortcut: import("@reduxjs/toolkit").ActionCreatorWithPayload<Shortcut, "shortcuts/addShortcut">, removeShortcut: import("@reduxjs/toolkit").ActionCreatorWithPayload<Shortcut, "shortcuts/removeShortcut">;
export declare const globalShortcuts: (state: RootState) => Shortcut[];
export declare const localShortcuts: (state: RootState) => Shortcut[];
