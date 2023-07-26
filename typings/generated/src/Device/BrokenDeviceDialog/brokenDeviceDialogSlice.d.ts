import type { RootState } from '../../store';
export interface BrokenDeviceDialog {
    isVisible: boolean;
    description: string;
    url: string;
}
export declare const reducer: import("redux").Reducer<BrokenDeviceDialog, import("redux").AnyAction>, hideDialog: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"brokenDeviceDialog/hideDialog">, showDialog: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, "brokenDeviceDialog/showDialog">;
export declare const isVisible: (state: RootState) => boolean;
export declare const info: (state: RootState) => {
    description: string;
    url: string;
};
//# sourceMappingURL=brokenDeviceDialogSlice.d.ts.map