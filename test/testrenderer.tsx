/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { Action, createStore } from 'redux';

import rootReducer from '../src/rootReducer';

const createPreparedStore = (actions: Action[]) => {
    const store = createStore(rootReducer());
    actions.forEach(store.dispatch);

    return store;
};

const PreparedProvider = (actions: Action[]) => (props: unknown) =>
    <Provider store={createPreparedStore(actions)} {...props} />;

export default (element: React.ReactElement, actions: Action[] = []) =>
    render(element, { wrapper: PreparedProvider(actions) });
