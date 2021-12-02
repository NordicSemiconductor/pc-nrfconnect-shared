/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { Action, createStore, Reducer } from 'redux';

import rootReducer from '../src/rootReducer';

const createPreparedStore = (actions: Action[], appReducer?: Reducer) => {
    const store = createStore(rootReducer(appReducer));
    actions.forEach(store.dispatch);

    return store;
};

const PreparedProvider =
    (actions: Action[], appReducer?: Reducer) => (props: unknown) =>
        (
            <Provider
                store={createPreparedStore(actions, appReducer)}
                {...props}
            />
        );

export default (
    element: React.ReactElement,
    actions: Action[] = [],
    appReducer?: Reducer
) => render(element, { wrapper: PreparedProvider(actions, appReducer) });
