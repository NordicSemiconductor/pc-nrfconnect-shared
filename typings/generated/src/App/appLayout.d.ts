import { AppLayout, RootState } from '../state';
interface PaneSpec {
    name: string;
    Main: unknown;
}
export declare const reducer: import("redux").Reducer<AppLayout, import("redux").AnyAction>, setCurrentPane: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, string>, setPanes: import("@reduxjs/toolkit").ActionCreatorWithPayload<PaneSpec[], string>, toggleLogVisible: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, toggleSidePanelVisible: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, switchToNextPane: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, switchToPreviousPane: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>;
export declare const isSidePanelVisible: (state: RootState) => boolean;
export declare const isLogVisible: (state: RootState) => boolean;
export declare const paneNames: (state: RootState) => string[];
export declare const currentPane: ({ appLayout }: RootState) => number;
export {};
