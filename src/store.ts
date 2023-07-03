/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { AnyAction, configureStore, ThunkAction } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import { reducer as shortcuts } from './About/shortcutSlice';
import { reducer as appLayout } from './App/appLayout';
import { reducer as brokenDeviceDialog } from './Device/BrokenDeviceDialog/brokenDeviceDialogSlice';
import { reducer as deviceAutoSelect } from './Device/deviceAutoSelectSlice';
import { reducer as deviceSetup } from './Device/deviceSetupSlice';
import { reducer as device } from './Device/deviceSlice';
import { reducer as errorDialog } from './ErrorDialog/errorDialogSlice';
import { reducer as flashMessages } from './FlashMessage/FlashMessageSlice';
import { reducer as log } from './Log/logSlice';

const ifBuiltForDevelopment = <X>(value: X) =>
    process.env.NODE_ENV === 'development' ? value : undefined;

const noopReducer: Reducer = (state = null) => state;

export const rootReducerSpec = (appReducer: Reducer = noopReducer) => ({
    app: appReducer,
    appLayout,
    device,
    deviceSetup,
    deviceAutoSelect,
    brokenDeviceDialog,
    errorDialog,
    log,
    shortcuts,
    flashMessages,
});

const store = (appReducer?: Reducer) =>
    configureStore({
        reducer: rootReducerSpec(appReducer),
        devTools: {
            maxAge: ifBuiltForDevelopment(100),
            serialize: ifBuiltForDevelopment(true),
        },
        middleware: getDefaultMiddleware =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    });

// Needed only to infer the types below
const concreteStore = store();

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    AnyAction
>;
export type RootState = ReturnType<typeof concreteStore.getState>;
export type AppDispatch = typeof concreteStore.dispatch;

export interface NrfConnectState<AppState> extends RootState {
    app: AppState;
}

export default store;
