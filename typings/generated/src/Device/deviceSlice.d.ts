import { Device, DeviceState, ForceAutoReconnect, RootState } from '../state';
export declare const reducer: import("redux").Reducer<DeviceState, import("redux").AnyAction>, deselectDevice: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, deviceSetupComplete: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, string>, deviceSetupError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, deviceSetupInputReceived: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, deviceSetupInputRequired: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[message: string, choices: string[]], {
    message: string;
    choices: string[];
}, string, never, never>, resetDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, string>, selectDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, string>, addDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, string>, removeDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, string>, setDevices: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device[], string>, setDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[serialNumber: string, nickname: string], {
    serialNumber: string;
    nickname: string;
}, string, never, never>, toggleDeviceFavorited: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, string>, setGlobalAutoReconnect: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, string>, setForceAutoReconnect: import("@reduxjs/toolkit").ActionCreatorWithPayload<ForceAutoReconnect, string>, clearAutoReconnect: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, setReadbackProtected: import("@reduxjs/toolkit").ActionCreatorWithPayload<"unknown" | "protected" | "unprotected", string>;
export declare const getDevice: (serialNumber: string) => (state: RootState) => Device | undefined;
export declare const sortedDevices: (state: RootState) => Device[];
export declare const deviceIsSelected: (state: RootState) => boolean;
export declare const getAutoReconnectDevice: (state: RootState) => import("../state").AutoReconnectDevice | null | undefined;
export declare const selectedDevice: (state: RootState) => Device | undefined;
export declare const deviceInfo: (state: RootState) => Device | null;
export declare const selectedSerialNumber: (state: RootState) => string | null;
export declare const getGlobalAutoReconnect: (state: RootState) => boolean;
export declare const getWaitingToAutoReconnect: (state: RootState) => boolean;
export declare const getReadbackProtection: (state: RootState) => "unknown" | "protected" | "unprotected";
