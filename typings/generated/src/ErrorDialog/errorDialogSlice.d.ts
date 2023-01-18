import { ErrorDialog, ErrorResolutions, RootState } from '../state';
export declare const reducer: import("redux").Reducer<ErrorDialog, import("redux").AnyAction>, hideDialog: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, showDialog: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[message: string, errorResolutions?: ErrorResolutions | undefined], {
    message: string;
    errorResolutions: ErrorResolutions | undefined;
}, string, never, never>;
export declare const isVisible: (state: RootState) => boolean;
export declare const messages: (state: RootState) => string[];
export declare const errorResolutions: (state: RootState) => ErrorResolutions | undefined;
//# sourceMappingURL=errorDialogSlice.d.ts.map