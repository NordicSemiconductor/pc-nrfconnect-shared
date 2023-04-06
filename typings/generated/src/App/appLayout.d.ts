import { AppLayout, RootState } from '../state';
interface PaneSpec {
    name: string;
    Main: unknown;
}
export declare const reducer: import("redux").Reducer<AppLayout, import("redux").AnyAction>, setCurrentPane: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "appLayout/setCurrentPane">, setPanes: import("@reduxjs/toolkit").ActionCreatorWithPayload<PaneSpec[], "appLayout/setPanes">, toggleLogVisible: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"appLayout/toggleLogVisible">, toggleSidePanelVisible: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"appLayout/toggleSidePanelVisible">, switchToNextPane: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"appLayout/switchToNextPane">, switchToPreviousPane: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"appLayout/switchToPreviousPane">;
export declare const isSidePanelVisible: (state: RootState) => boolean;
export declare const isLogVisible: (state: RootState) => boolean;
export declare const paneNames: (state: RootState) => string[];
export declare const currentPane: ({ appLayout }: RootState) => number;
export {};
