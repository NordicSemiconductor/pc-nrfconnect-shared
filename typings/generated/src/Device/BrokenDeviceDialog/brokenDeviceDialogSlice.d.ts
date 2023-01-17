import { BrokenDeviceDialog, RootState } from '../../state';
export declare const reducer: import("redux").Reducer<BrokenDeviceDialog, import("redux").AnyAction>, hideDialog: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, showDialog: import("@reduxjs/toolkit").ActionCreatorWithPayload<any, string>;
export declare const isVisible: (state: RootState) => boolean;
export declare const info: (state: RootState) => {
    description: string;
    url: string;
};
