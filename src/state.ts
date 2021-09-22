/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Device as NrfdlDevice } from '@nordicsemiconductor/nrf-device-lib-js';

export interface RootState {
    appLayout: AppLayout;
    appReloadDialog: AppReloadDialog;
    errorDialog: ErrorDialog;
    log: Log;
    device: DeviceState;
}

export interface AppLayout {
    isSidePanelVisible: boolean;
    isLogVisible: boolean;
    currentPane: number;
    panes: AppLayoutPane[];
}

export interface AppLayoutPane {
    name: string;
}

export interface AppReloadDialog {
    isVisible: boolean;
    message: string;
}

export interface ErrorDialog {
    isVisible: boolean;
    messages: string[];
    errorResolutions?: { [key: string]: () => void };
}

export interface ErrorResolutions {
    [key: string]: () => void;
}

export interface Log {
    autoScroll: boolean;
    logEntries: LogEntry[];
}

export interface LogEntry {
    id: number;
    timestamp: string;
    level: string;
    message: string;
}

export type Devices = { [key: string]: Device | undefined };
export interface DeviceState {
    devices: Devices;
    deviceInfo: DeviceInfo | null;
    isSetupDialogVisible: boolean;
    isSetupWaitingForUserInput: boolean;
    selectedSerialNumber: string | null;
    setupDialogChoices: readonly string[];
    setupDialogText: string | null;
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

export interface Serialport {
    path: string;
    manufacturer: string;
    productId: string;
    serialNumber: string;
    vendorId: string;
    /**
     * @deprecated Using the property `comName` has been
     * deprecated. You should now use `path`. The property
     * will be removed in the next major release.
     */
    comName: string;
}

export interface Device extends Omit<NrfdlDevice, 'usb' | 'jlink'> {
    /**
     * @deprecated Using the property `serialnumber` has been
     * deprecated. You should now use `serialNumber`. The property
     * will be removed in the next major release.
     */
    serialnumber?: string; // from nrf-device-lib
    /**
     * @deprecated Using the property `serialports` has been
     * deprecated. You should now use `serialPorts`. The property
     * will be removed in the next major release.
     */
    serialports?: Serialport[]; // from nrf-device-lib
    // traits: DeviceTraits; // from nrf-device-lib
    usb?: {
        product?: string;
    }; // from nrf-device-lib
    jlink?: {
        boardVersion: string;
    }; // from nrf-device-lib
    serialNumber: string;
    boardVersion?: string;
    nickname?: string;
    serialport?: Serialport;
    favorite?: boolean;
}
