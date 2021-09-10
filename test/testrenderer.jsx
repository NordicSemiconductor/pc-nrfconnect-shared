/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { combineReducers, createStore } from 'redux';

import coreReducers from '../src/coreReducers';

const createPreparedStore = actions => {
    const store = createStore(combineReducers(coreReducers));
    actions.forEach(store.dispatch);

    return store;
};

const PreparedProvider = actions => props =>
    <Provider store={createPreparedStore(actions)} {...props} />;

export default (element, actions = []) =>
    render(element, { wrapper: PreparedProvider(actions) });
