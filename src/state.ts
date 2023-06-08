/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AnyAction, ThunkDispatch } from '@reduxjs/toolkit';

import type { DocumentationState } from './About/documentationSlice';
import type { ShortcutState } from './About/shortcutSlice';
import type { AppLayout } from './App/appLayout';
import type { BrokenDeviceDialog } from './Device/BrokenDeviceDialog/brokenDeviceDialogSlice';
import type { DeviceAutoSelectState } from './Device/deviceAutoSelectSlice';
import type { DeviceSetupState } from './Device/deviceSetupSlice';
import type { DeviceState } from './Device/deviceSlice';
import type { ErrorDialog } from './ErrorDialog/errorDialogSlice';
import type { Log } from './Log/logSlice';

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
    deviceSetup: DeviceSetupState;
    documentation: DocumentationState;
    brokenDeviceDialog: BrokenDeviceDialog;
    shortcuts: ShortcutState;
}
