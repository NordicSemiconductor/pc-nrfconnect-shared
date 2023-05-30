/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import { Provider } from 'react-redux';
import { applyMiddleware, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import rootReducer from '../rootReducer';

const ifBuiltForDevelopment = <X,>(value: X) =>
    process.env.NODE_ENV === 'development' ? value : undefined;

const composeEnhancers = composeWithDevTools({
    maxAge: ifBuiltForDevelopment(100),
    serialize: ifBuiltForDevelopment(true),
});

export default ({
    appReducer,
    children,
}: {
    appReducer?: Reducer;
    children: ReactNode;
}) => (
    <Provider
        store={createStore(
            rootReducer(appReducer),
            composeEnhancers(applyMiddleware(thunk))
        )}
    >
        {children}
    </Provider>
);
