/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { Reducer } from 'redux';

import rootReducer from '../rootReducer';

const ifBuiltForDevelopment = <X,>(value: X) =>
    process.env.NODE_ENV === 'development' ? value : undefined;

export default ({
    appReducer,
    children,
}: {
    appReducer?: Reducer;
    children: ReactNode;
}) => (
    <Provider
        store={configureStore({
            reducer: rootReducer(appReducer),
            devTools: {
                maxAge: ifBuiltForDevelopment(100),
                serialize: ifBuiltForDevelopment(true),
            },
            middleware: getDefaultMiddleware =>
                getDefaultMiddleware({
                    serializableCheck: false,
                }),
        })}
    >
        {children}
    </Provider>
);
