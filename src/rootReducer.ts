/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers, Reducer } from 'redux';

import { reducer as documentation } from './About/documentationSlice';
import { reducer as shortcuts } from './About/shortcutSlice';
import { reducer as appLayout } from './App/appLayout';
import { reducer as brokenDeviceDialog } from './Device/BrokenDeviceDialog/brokenDeviceDialogSlice';
import { reducer as deviceAutoSelect } from './Device/deviceAutoSelectSlice';
import { reducer as deviceSetup } from './Device/deviceSetupSlice';
import { reducer as device } from './Device/deviceSlice';
import { reducer as errorDialog } from './ErrorDialog/errorDialogSlice';
import { reducer as log } from './Log/logSlice';

const coreReducers = {
    appLayout,
    device,
    deviceSetup,
    deviceAutoSelect,
    brokenDeviceDialog,
    errorDialog,
    log,
    documentation,
    shortcuts,
};

const noopReducer: Reducer = (state = null) => state;

export default <AppState>(appReducer: Reducer<AppState> = noopReducer) =>
    combineReducers({ app: appReducer, ...coreReducers });
