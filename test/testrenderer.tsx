/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import { Action, AnyAction, Reducer } from 'redux';
import { ThunkAction } from 'redux-thunk';

import createStore from '../src/store';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TAction = ThunkAction<void, any, null, AnyAction>;

const createPreparedStore = (
    actions: (Action | TAction)[],
    appReducer?: Reducer
) => {
    const store = createStore(appReducer);
    actions.forEach(store.dispatch);

    return store;
};

const preparedProvider =
    (actions: (Action | TAction)[], appReducer?: Reducer) => (props: object) =>
        (
            <Provider
                store={createPreparedStore(actions, appReducer)}
                {...props}
            />
        );

export const testRendererForApps =
    (appReducer?: Reducer) =>
    (element: React.ReactElement, actions: (Action | TAction)[] = []) =>
        render(element, { wrapper: preparedProvider(actions, appReducer) });

export default (
    element: React.ReactElement,
    actions: (Action | TAction)[] = [], // eslint-disable-line default-param-last -- Because we want to allow people to specify actions but no specifix reducer
    appReducer?: Reducer
) => render(element, { wrapper: preparedProvider(actions, appReducer) });
