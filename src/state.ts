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
import { LogEntry } from 'winston';

import type { DocumentationState } from './About/documentationSlice';
import type { ShortcutState } from './About/shortcutSlice';

export type TDispatch = ThunkDispatch<RootState, null, AnyAction>;

export interface RootState {
    appLayout: AppLayout;
    appReloadDialog: AppReloadDialog;
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

export interface AppReloadDialog {
    isVisible: boolean;
    message: string;
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

export type Devices = { [key: string]: Device | undefined };
export interface DeviceState {
    devices: Devices;
    deviceInfo: Device | null;
    isSetupDialogVisible: boolean;
    isSetupWaitingForUserInput: boolean | string;
    selectedSerialNumber: string | null;
    setupDialogChoices: readonly string[];
    setupDialogText?: string | null;
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
}

export interface BrokenDeviceDialog {
    isVisible: boolean;
    description: string;
    url: string;
}
