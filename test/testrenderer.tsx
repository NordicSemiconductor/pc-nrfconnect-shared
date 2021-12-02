/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { Action, applyMiddleware, createStore, Reducer } from 'redux';
import thunk from 'redux-thunk';

import rootReducer from '../src/rootReducer';

const createPreparedStore = (actions: Action[], appReducer?: Reducer) => {
    const store = createStore(rootReducer(appReducer), applyMiddleware(thunk));
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

export const testRendererForApps =
    (appReducer?: Reducer) =>
    (element: React.ReactElement, actions: Action[] = []) =>
        render(element, { wrapper: PreparedProvider(actions, appReducer) });

export default (
    element: React.ReactElement,
    actions: Action[] = [],
    appReducer?: Reducer
) => render(element, { wrapper: PreparedProvider(actions, appReducer) });
