/// <reference types="node" />
import { Device, DeviceAutoSelectState, ForceAutoReselect, RootState } from '../state';
export declare const reducer: import("redux").Reducer<DeviceAutoSelectState, import("redux").AnyAction>, setAutoReconnectTimeoutID: import("@reduxjs/toolkit").ActionCreatorWithPayload<NodeJS.Timeout, string>, clearAutoReconnectTimeoutID: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>, setAutoSelectDevice: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<Device | undefined, string>, setDisconnectedTime: import("@reduxjs/toolkit").ActionCreatorWithOptionalPayload<number | undefined, string>, setGlobalAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithPayload<boolean, string>, setForceAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithPayload<ForceAutoReselect, string>, clearAutoReselect: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<string>;
export declare const getAutoReselectDevice: (state: RootState) => Device | undefined;
export declare const getGlobalAutoReselect: (state: RootState) => boolean;
export declare const getWaitingToAutoReselect: (state: RootState) => boolean;
export declare const getDisconnectionTime: (state: RootState) => number | undefined;
export declare const getForceReselect: (state: RootState) => ForceAutoReselect | undefined;
