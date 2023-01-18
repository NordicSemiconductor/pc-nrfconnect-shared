/// <reference types="node" />
import { Device, TDispatch } from '../state';
import { InitPacket } from './initPacket';
import { PromiseChoice, PromiseConfirm } from './sdfuOperations';
export interface DfuEntry {
    application: string;
    semver: string;
    softdevice?: string | Buffer;
    params: Partial<InitPacket>;
}
export interface DeviceSetup {
    dfu?: {
        [key: string]: DfuEntry;
    };
    jprog?: {
        [key: string]: {
            fw: string;
            fwIdAddress: number;
            fwVersion: string;
        };
    };
    needSerialport?: boolean;
    allowCustomDevice?: boolean;
    promiseChoice?: PromiseChoice;
    promiseConfirm?: PromiseConfirm;
}
export declare const receiveDeviceSetupInput: (input: boolean | string) => (dispatch: TDispatch) => void;
export declare const prepareDevice: (device: Device, deviceSetupConfig: DeviceSetup) => Promise<Device>;
export declare const setupDevice: (device: Device, deviceSetup: DeviceSetup, releaseCurrentDevice: () => void, onDeviceIsReady: (device: Device) => void, doStartWatchingDevices: () => void, doDeselectDevice: () => void) => (dispatch: TDispatch) => Promise<void>;
