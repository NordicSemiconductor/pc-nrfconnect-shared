import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';
import { Device, DeviceState, RootState } from '../state';
export declare const reducer: import("redux").Reducer<DeviceState, import("redux").AnyAction>, deselectDevice: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"device/deselectDevice">, deviceSetupComplete: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/deviceSetupComplete">, deviceSetupError: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"device/deviceSetupError">, deviceSetupInputReceived: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"device/deviceSetupInputReceived">, deviceSetupInputRequired: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[message: string, choices: string[]], {
    message: string;
    choices: string[];
}, "device/deviceSetupInputRequired", never, never>, resetDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "device/resetDeviceNickname">, selectDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/selectDevice">, addDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/addDevice">, removeDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/removeDevice">, setDevices: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device[], "device/setDevices">, setDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[serialNumber: string, nickname: string], {
    serialNumber: string;
    nickname: string;
}, "device/setDeviceNickname", never, never>, toggleDeviceFavorited: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "device/toggleDeviceFavorited">, closeSetupDialogVisible: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"device/closeSetupDialogVisible">, setReadbackProtected: import("@reduxjs/toolkit").ActionCreatorWithPayload<"unknown" | "protected" | "unprotected", "device/setReadbackProtected">, persistSerialPortOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<SerialPortOpenOptions<AutoDetectTypes>, "device/persistSerialPortOptions">;
export declare const getDevice: (serialNumber: string) => (state: RootState) => Device | undefined;
export declare const getDevices: (state: RootState) => Map<string, Device>;
export declare const deviceIsSelected: (state: RootState) => boolean;
export declare const selectedDevice: (state: RootState) => Device | undefined;
export declare const deviceInfo: (state: RootState) => Device | null;
export declare const selectedSerialNumber: (state: RootState) => string | null;
export declare const getReadbackProtection: (state: RootState) => "unknown" | "protected" | "unprotected";
