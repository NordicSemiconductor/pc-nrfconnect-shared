/// <reference types="react" />
import { Device as NrfdlDevice, SerialPort } from '@nordicsemiconductor/nrf-device-lib-js';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import { LogEntry } from 'winston';
import type { DocumentationState } from './About/documentationSlice';
import type { ShortcutState } from './About/shortcutSlice';
export declare type TDispatch = ThunkDispatch<RootState, null, AnyAction>;
export interface NrfConnectState<AppState> extends RootState {
    app: AppState;
}
export interface RootState {
    appLayout: AppLayout;
    errorDialog: ErrorDialog;
    log: Log;
    device: DeviceState;
    documentation: DocumentationState;
    brokenDeviceDialog: BrokenDeviceDialog;
    shortcuts: ShortcutState;
}
export interface AppLayout {
    isSidePanelVisible: boolean;
    isLogVisible: boolean;
    currentPane: number;
    paneNames: string[];
}
export interface ErrorDialog {
    isVisible: boolean;
    messages: string[];
    errorResolutions?: ErrorResolutions;
}
export interface ErrorResolutions {
    [key: string]: () => void;
}
export interface Log {
    autoScroll: boolean;
    logEntries: LogEntry[];
    isLoggingVerbose: boolean;
}
export interface DeviceState {
    devices: Map<string, Device>;
    deviceInfo: Device | null;
    isSetupDialogVisible: boolean;
    isSetupWaitingForUserInput: boolean | string;
    selectedSerialNumber: string | null;
    setupDialogChoices: readonly string[];
    setupDialogText?: string | null;
    autoReconnectDevice?: AutoReconnectDevice | null;
    autoReconnect: boolean;
    readbackProtection: 'unknown' | 'protected' | 'unprotected';
}
export interface ForceAutoReconnect {
    timeout: number;
    when: 'always' | 'applicationMode' | 'BootLoaderMode';
    onSuccess?: (device: Device) => void;
    onFail?: () => void;
}
export interface AutoReconnectDevice {
    device: Device;
    disconnectionTime?: number;
    forceReconnect?: ForceAutoReconnect;
}
export interface DeviceInfo {
    name?: string;
    cores?: number;
    icon: React.ElementType;
    website: {
        productPagePath?: string;
        buyOnlineParams?: string;
    };
}
export interface Device extends NrfdlDevice {
    boardVersion?: string;
    nickname?: string;
    serialport?: SerialPort;
    favorite?: boolean;
    id: number;
}
export interface BrokenDeviceDialog {
    isVisible: boolean;
    description: string;
    url: string;
}
