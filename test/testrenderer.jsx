/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { createStore } from 'redux';

import rootReducer from '../src/rootReducer';

const createPreparedStore = actions => {
    const store = createStore(rootReducer());
    actions.forEach(store.dispatch);

    return store;
};

const PreparedProvider = actions => props =>
    <Provider store={createPreparedStore(actions)} {...props} />;

export default (element, actions = []) =>
    render(element, { wrapper: PreparedProvider(actions) });
