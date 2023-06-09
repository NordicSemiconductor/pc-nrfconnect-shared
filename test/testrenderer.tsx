/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { Action, Reducer } from 'redux';

import createStore from '../src/store';

const createPreparedStore = (actions: Action[], appReducer?: Reducer) => {
    const store = createStore(appReducer);
    actions.forEach(store.dispatch);

    return store;
};

const preparedProvider =
    (actions: Action[], appReducer?: Reducer) => (props: object) =>
        (
            <Provider
                store={createPreparedStore(actions, appReducer)}
                {...props}
            />
        );

export const testRendererForApps =
    (appReducer?: Reducer) =>
    (element: React.ReactElement, actions: Action[] = []) =>
        render(element, { wrapper: preparedProvider(actions, appReducer) });

export default (
    element: React.ReactElement,
    actions: Action[] = [], // eslint-disable-line default-param-last -- Because we want to allow people to specify actions but no specifix reducer
    appReducer?: Reducer
) => render(element, { wrapper: preparedProvider(actions, appReducer) });
