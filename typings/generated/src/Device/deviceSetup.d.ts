/// <reference types="node" />
import { Device, TDispatch } from '../state';
import { InitPacket } from './initPacket';
import { PromiseChoice } from './sdfuOperations';
export interface DfuEntry {
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}
export interface JprogEntry {
    key: string;
    fw: string;
    fwIdAddress: number;
    fwVersion: string;
}
export type PromiseConfirm = (message: string) => Promise<boolean>;
export interface IDeviceSetup {
    supportsProgrammingMode: (device: Device) => boolean;
    getFirmwareOptions: (device: Device) => {
        key: string;
        programDevice: () => (dispatch: TDispatch) => Promise<Device>;
    }[];
    isExpectedFirmware: (device: Device) => (dispatch: TDispatch) => Promise<{
        device: Device;
        validFirmware: boolean;
    }>;
    tryToApplicationMode: (device: Device) => (dispatch: TDispatch) => Promise<Device>;
}
export interface DeviceSetup {
    deviceSetups: IDeviceSetup[];
    needSerialport: boolean;
    allowCustomDevice?: boolean;
    promiseChoice?: PromiseChoice;
    promiseConfirm?: PromiseConfirm;
}
export declare const receiveDeviceSetupInput: (input: boolean | string) => (dispatch: TDispatch) => void;
export declare const setupDevice: (device: Device, deviceSetup: DeviceSetup, releaseCurrentDevice: () => void, onDeviceIsReady: (device: Device) => void, doDeselectDevice: () => void) => (dispatch: TDispatch) => Promise<void>;
