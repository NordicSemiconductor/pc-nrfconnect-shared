import { RootState } from '../state';
export interface Shortcut {
    hotKey: string[] | string;
    title: string;
    isGlobal: boolean;
    action: () => void;
}
export declare type ShortcutState = Set<Shortcut>;
export declare const reducer: import("redux").Reducer<ShortcutState, import("redux").AnyAction>, addShortcut: import("@reduxjs/toolkit").ActionCreatorWithPayload<Shortcut, string>, removeShortcut: import("@reduxjs/toolkit").ActionCreatorWithPayload<Shortcut, string>;
export declare const globalShortcuts: (state: RootState) => Shortcut[];
export declare const localShortcuts: (state: RootState) => Shortcut[];
