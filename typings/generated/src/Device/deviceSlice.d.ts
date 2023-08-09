import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';
import { NrfutilDevice, SerialPort } from '../../nrfutil/device/common';
import type { RootState } from '../store';
export interface Device extends NrfutilDevice {
    serialNumber: string;
    boardVersion?: string;
    nickname?: string;
    serialport?: SerialPort;
    favorite?: boolean;
    id: number;
    persistedSerialPortOptions?: SerialPortOpenOptions<AutoDetectTypes>;
}
export interface DeviceState {
    devices: Map<string, Device>;
    deviceInfo: Device | null;
    selectedSerialNumber: string | null;
    readbackProtection: 'unknown' | 'protected' | 'unprotected';
}
export declare const reducer: import("redux").Reducer<DeviceState, import("redux").AnyAction>, deselectDevice: import("@reduxjs/toolkit").ActionCreatorWithoutPayload<"device/deselectDevice">, resetDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "device/resetDeviceNickname">, selectDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/selectDevice">, addDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/addDevice">, removeDevice: import("@reduxjs/toolkit").ActionCreatorWithPayload<Device, "device/removeDevice">, setDeviceNickname: import("@reduxjs/toolkit").ActionCreatorWithPreparedPayload<[serialNumber: string, nickname: string], {
    serialNumber: string;
    nickname: string;
}, "device/setDeviceNickname", never, never>, toggleDeviceFavorited: import("@reduxjs/toolkit").ActionCreatorWithPayload<string, "device/toggleDeviceFavorited">, setReadbackProtected: import("@reduxjs/toolkit").ActionCreatorWithPayload<"unknown" | "protected" | "unprotected", "device/setReadbackProtected">, persistSerialPortOptions: import("@reduxjs/toolkit").ActionCreatorWithPayload<SerialPortOpenOptions<AutoDetectTypes>, "device/persistSerialPortOptions">;
export declare const getDevice: (serialNumber: string) => (state: RootState) => Device | undefined;
export declare const getDevices: (state: RootState) => Map<string, Device>;
export declare const deviceIsSelected: (state: RootState) => boolean;
export declare const selectedDevice: (state: RootState) => Device | undefined;
export declare const deviceInfo: (state: RootState) => Device | null;
export declare const selectedSerialNumber: (state: RootState) => string | null;
export declare const getReadbackProtection: (state: RootState) => "unknown" | "protected" | "unprotected";
//# sourceMappingURL=deviceSlice.d.ts.map