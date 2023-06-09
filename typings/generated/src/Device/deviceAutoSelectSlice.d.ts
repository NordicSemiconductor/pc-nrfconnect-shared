/// <reference types="node" />
import type { RootState } from '../store';
import type { Device } from './deviceSlice';
export interface WaitForDevice {
    timeout: number;
    when: 'always' | 'applicationMode' | 'dfuBootLoaderMode' | 'sameTraits';
    once: boolean;
    onSuccess?: (device: Device) => void;
    onFail?: (reason?: string) => void;
}
export interface DeviceAutoSelectState {
    autoReselect: boolean;
    device?: Device;
    disconnectionTime?: number;
    waitForDevice?: WaitForDevice;
    autoReconnectTimeout?: NodeJS.Timeout;
    lastArrivedDeviceId?: number;
    arrivedButWrongWhen?: boolean;
}
export declare const reducer: import("redux").Reducer<DeviceAutoSelectState, import("redux").AnyAction>, setWaitForDeviceTimeout: import("@reduxjs/toolkit").ActionCreatorWithPayload<NodeJS.Timeout, "deviceAutoSelect/setWaitForDeviceTimeout">, clearWaitForDeviceTimeout: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"deviceAutoSelect/clearWaitForDeviceTimeout">, setAutoSelectDevice: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Device | undefined, "deviceAutoSelect/setAutoSelectDevice">, setDisconnectedTime: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<number | undefined, "deviceAutoSelect/setDisconnectedTime">, setAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, "deviceAutoSelect/setAutoReselect">, setWaitForDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<WaitForDevice, "deviceAutoSelect/setWaitForDevice">, clearWaitForDevice: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"deviceAutoSelect/clearWaitForDevice">, setLastArrivedDeviceId: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<number | undefined, "deviceAutoSelect/setLastArrivedDeviceId">, setArrivedButWrongWhen: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<boolean | undefined, "deviceAutoSelect/setArrivedButWrongWhen">;
export declare const getAutoReselectDevice: (state: RootState) => Device | undefined;
export declare const getAutoReselect: (state: RootState) => boolean;
export declare const getWaitingToAutoReselect: (state: RootState) => boolean;
export declare const getWaitingForDeviceTimeout: (state: RootState) => boolean;
export declare const getDisconnectionTime: (state: RootState) => number | undefined;
export declare const getWaitForDevice: (state: RootState) => WaitForDevice | undefined;
export declare const getLastArrivedDeviceId: (state: RootState) => number | undefined;
export declare const getArrivedButWrongWhen: (state: RootState) => boolean | undefined;
