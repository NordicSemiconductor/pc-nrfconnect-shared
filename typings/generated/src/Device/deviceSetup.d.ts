/// <reference types="node" />
import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js';
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
type PromiseChoice = (question: string, choices: string[]) => Promise<{
    choice: string;
    index: number;
}>;
export declare const progressJson: ({ progressJson: progress }: nrfDeviceLib.Progress.CallbackParameters) => (dispatch: TDispatch) => void;
export type PromiseConfirm = (message: string) => Promise<boolean>;
export interface IDeviceSetup {
    supportsProgrammingMode: (device: Device) => boolean;
    getFirmwareOptions: (device: Device) => {
        key: string;
        description?: string;
        programDevice: (promiseConfirm?: PromiseConfirm) => (dispatch: TDispatch) => Promise<Device>;
    }[];
    isExpectedFirmware: (device: Device) => (dispatch: TDispatch) => Promise<{
        device: Device;
        validFirmware: boolean;
    }>;
    tryToSwitchToApplicationMode: (device: Device) => (dispatch: TDispatch) => Promise<Device | null>;
}
export interface DeviceSetup {
    deviceSetups: IDeviceSetup[];
    needSerialport: boolean;
    allowCustomDevice?: boolean;
    promiseChoice?: PromiseChoice;
    promiseConfirm?: PromiseConfirm;
}
export declare const receiveDeviceSetupInput: (input: boolean | {
    choice: string;
    index: number;
}) => (dispatch: TDispatch) => void;
export declare const prepareDevice: (device: Device, deviceSetupConfig: DeviceSetup, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void, checkCurrentFirmwareVersion: boolean) => (dispatch: TDispatch) => Promise<void>;
export declare const setupDevice: (device: Device, deviceSetup: DeviceSetup, releaseCurrentDevice: () => void, onDeviceIsReady: (device: Device) => void, doDeselectDevice: () => void) => (dispatch: TDispatch, getState: () => RootState) => void;
export {};
