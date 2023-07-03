/// <reference types="node" />
import { AppThunk } from '../store';
import { Device } from './deviceSlice';
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
export interface DeviceSetup {
    supportsProgrammingMode: (device: Device) => boolean;
    getFirmwareOptions: (device: Device) => {
        key: string;
        description?: string;
        programDevice: (onProgress: (progress: number, message?: string) => void) => AppThunk<Promise<Device>>;
    }[];
    isExpectedFirmware: (device: Device) => AppThunk<Promise<{
        device: Device;
        validFirmware: boolean;
    }>>;
    tryToSwitchToApplicationMode: (device: Device) => AppThunk<Promise<Device | null>>;
}
export interface DeviceSetupConfig {
    deviceSetups: DeviceSetup[];
    allowCustomDevice?: boolean;
    confirmMessage?: string;
    choiceMessage?: string;
}
export declare const prepareDevice: (device: Device, deviceSetupConfig: DeviceSetupConfig, onSuccess: (device: Device) => void, onFail: (reason?: unknown) => void, checkCurrentFirmwareVersion?: boolean, requireUserConfirmation?: boolean) => AppThunk<Promise<void>>;
export declare const setupDevice: (device: Device, deviceSetupConfig: DeviceSetupConfig, onDeviceIsReady: (device: Device) => void, doDeselectDevice: () => void) => AppThunk<void>;
