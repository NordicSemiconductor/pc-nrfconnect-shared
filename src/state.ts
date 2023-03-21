/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Device as NrfdlDevice,
    SerialPort,
} from '@nordicsemiconductor/nrf-device-lib-js';
import { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';
import { LogEntry } from 'winston';

import type { DocumentationState } from './About/documentationSlice';
import type { ShortcutState } from './About/shortcutSlice';

export type TDispatch = ThunkDispatch<RootState, null, AnyAction>;

export interface NrfConnectState<AppState> extends RootState {
    app: AppState;
}

export interface RootState {
    appLayout: AppLayout;
    errorDialog: ErrorDialog;
    log: Log;
    deviceAutoSelect: DeviceAutoSelectState;
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
    readbackProtection: 'unknown' | 'protected' | 'unprotected';
}

export interface DeviceAutoSelectState {
    autoReselect: boolean;
    device?: Device;
    disconnectionTime?: number;
    waitForDevice?: WaitForDevice;
    autoReconnectTimeout?: NodeJS.Timeout;
    lastArrivedDeviceId?: number;
}

export interface WaitForDevice {
    timeout: number;
    when: 'always' | 'applicationMode' | 'BootLoaderMode';
    once: boolean;
    onSuccess?: (device: Device) => void;
    onFail?: (reason?: string) => void;
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
    persistedSerialPortOptions?: SerialPortOpenOptions<AutoDetectTypes>;
}

export interface BrokenDeviceDialog {
    isVisible: boolean;
    description: string;
    url: string;
}
