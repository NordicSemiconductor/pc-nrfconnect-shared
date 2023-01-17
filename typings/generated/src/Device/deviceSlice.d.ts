import { Device, DeviceState, RootState } from '../state';
export declare const reducer: import("redux").Reducer<DeviceState, import("redux").AnyAction>, deselectDevice: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, deviceSetupComplete: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, string>, deviceSetupError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, deviceSetupInputReceived: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, deviceSetupInputRequired: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[message: string, choices: string[]], {
    message: string;
    choices: string[];
}, string, never, never>, devicesDetected: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device[], string>, resetDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, string>, selectDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, string>, setDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[serialNumber: string, nickname: string], {
    serialNumber: string;
    nickname: string;
}, string, never, never>, toggleDeviceFavorited: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, string>;
export declare const getDevice: (serialNumber: string) => (state: RootState) => Device | undefined;
export declare const sortedDevices: (state: RootState) => Device[];
export declare const deviceIsSelected: (state: RootState) => boolean;
export declare const selectedDevice: (state: RootState) => Device | undefined;
export declare const deviceInfo: (state: RootState) => Device | null;
export declare const selectedSerialNumber: (state: RootState) => string | null;
