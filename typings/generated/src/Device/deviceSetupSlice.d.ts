import { RootState } from '../state';
export interface DeviceSetupState {
    visible: boolean;
    onUserInput?: (canceled: boolean, choice?: number) => void;
    message: string;
    progressMessage?: string;
    choices?: string[];
    progress?: number;
}
export declare const reducer: import("redux").Reducer<DeviceSetupState, import("redux").AnyAction>, openDeviceSetupDialog: import("@reduxjs/toolkit").ActionCreatorWithPayload<{
    onUserInput?: ((canceled: boolean, choice?: number) => void) | undefined;
    message: string;
    choices?: string[] | undefined;
}, "deviceSetup/openDeviceSetupDialog">, closeDeviceSetupDialog: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"deviceSetup/closeDeviceSetupDialog">, setDeviceSetupProgress: import("@reduxjs/toolkit").ActionCreatorWithPayload<number, "deviceSetup/setDeviceSetupProgress">, setDeviceSetupMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "deviceSetup/setDeviceSetupMessage">, setDeviceSetupProgressMessage: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "deviceSetup/setDeviceSetupProgressMessage">, deviceSetupUserInputReceived: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"deviceSetup/deviceSetupUserInputReceived">;
export declare const isDeviceSetupDialogVisible: (state: RootState) => boolean;
export declare const getDeviceSetupProgress: (state: RootState) => number | undefined;
export declare const getDeviceSetupMessage: (state: RootState) => string;
export declare const getDeviceSetupProgressMessage: (state: RootState) => string | undefined;
export declare const getDeviceSetupChoices: (state: RootState) => string[] | undefined;
export declare const getDeviceSetupUserInputCallback: (state: RootState) => ((canceled: boolean, choice?: number) => void) | undefined;
