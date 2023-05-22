/// <reference types="node" />
import { Device, RootState, TDispatch } from '../state';
import { InitPacket } from './initPacket';
export interface DfuEntry {
    key: string;
    description?: string;
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}
export interface JprogEntry {
    key: string;
    description?: string;
    fw: string;
    fwIdAddress: number;
    fwVersion: string;
}
export interface IDeviceSetup {
    supportsProgrammingMode: (device: Device) => boolean;
    getFirmwareOptions: (device: Device) => {
        key: string;
        description?: string;
        programDevice: (onProgress: (progress: number, message?: string) => void) => (dispatch: TDispatch, getState: () => RootState) => Promise<Device>;
    }[];
    isExpectedFirmware: (device: Device) => (dispatch: TDispatch, getState: () => RootState) => Promise<{
        device: Device;
        validFirmware: boolean;
    }>;
    tryToSwitchToApplicationMode: (device: Device) => (dispatch: TDispatch, getState: () => RootState) => Promise<Device | null>;
}
export interface DeviceSetup {
    deviceSetups: IDeviceSetup[];
    allowCustomDevice?: boolean;
}
export declare const prepareDevice: (device: Device, deviceSetupConfig: DeviceSetup, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void, checkCurrentFirmwareVersion?: boolean, requireUserConfirmation?: boolean) => (dispatch: TDispatch) => Promise<void>;
export declare const setupDevice: (device: Device, deviceSetup: DeviceSetup, releaseCurrentDevice: () => void, onDeviceIsReady: (device: Device) => void, doDeselectDevice: () => void) => (dispatch: TDispatch, getState: () => RootState) => void;
