/// <reference types="node" />
import { Device, DeviceAutoSelectState, RootState, WaitForDevice } from '../state';
export declare const reducer: import("redux").Reducer<DeviceAutoSelectState, import("redux").AnyAction>, setWaitForDeviceTimeout: import("@reduxjs/toolkit").ActionCreatorWithPayload<NodeJS.Timeout, "deviceAutoSelect/setWaitForDeviceTimeout">, clearWaitForDeviceTimeout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"deviceAutoSelect/clearWaitForDeviceTimeout">, setAutoSelectDevice: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Device | undefined, "deviceAutoSelect/setAutoSelectDevice">, setDisconnectedTime: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<number | undefined, "deviceAutoSelect/setDisconnectedTime">, setAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "deviceAutoSelect/setAutoReselect">, setWaitForDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<WaitForDevice, "deviceAutoSelect/setWaitForDevice">, clearWaitForDevice: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"deviceAutoSelect/clearWaitForDevice">, setLastArrivedDeviceId: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<number | undefined, "deviceAutoSelect/setLastArrivedDeviceId">;
export declare const getAutoReselectDevice: (state: RootState) => Device | undefined;
export declare const getAutoReselect: (state: RootState) => boolean;
export declare const getWaitingToAutoReselect: (state: RootState) => boolean;
export declare const getWaitingForDeviceTimeout: (state: RootState) => boolean;
export declare const getDisconnectionTime: (state: RootState) => number | undefined;
export declare const getWaitForDevice: (state: RootState) => WaitForDevice | undefined;
export declare const getLastArrivedDeviceId: (state: RootState) => number | undefined;
