import { ErrorDialog, ErrorMessage, ErrorResolutions, RootState } from '../state';
export declare const reducer: import("redux").Reducer<ErrorDialog, import("redux").AnyAction>, hideDialog: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"errorDialog/hideDialog">, showDialog: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[message: string, errorResolutions?: ErrorResolutions | undefined, detail?: string | undefined], {
    message: {
        message: string;
        detail: string | undefined;
    };
    errorResolutions: ErrorResolutions | undefined;
}, "errorDialog/showDialog", never, never>;
export declare const isVisible: (state: RootState) => boolean;
export declare const messages: (state: RootState) => ErrorMessage[];
export declare const errorResolutions: (state: RootState) => ErrorResolutions | undefined;
