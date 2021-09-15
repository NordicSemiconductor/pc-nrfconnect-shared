/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { func, node } from 'prop-types';
import { applyMiddleware, combineReducers, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import coreReducers from '../coreReducers';

const rootReducer = appReducer =>
    combineReducers({ app: appReducer, ...coreReducers });
const middleware = composeWithDevTools(applyMiddleware(thunk));

const ConnectedToStore = ({ appReducer, children }) => (
    <Provider store={createStore(rootReducer(appReducer), middleware)}>
        {children}
    </Provider>
);
ConnectedToStore.propTypes = {
    appReducer: func.isRequired,
    children: node.isRequired,
};

export default ConnectedToStore;
