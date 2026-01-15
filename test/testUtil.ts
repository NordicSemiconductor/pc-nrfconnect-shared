/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { combineReducers, type Reducer } from 'redux';

import { rootReducerSpec } from '../src/store';
import dispatchTo from './dispatchTo';
import { testRendererForApps } from './testrenderer';

const rootReducer = <AppState>(appReducer?: Reducer<AppState>) =>
    combineReducers(rootReducerSpec(appReducer));

export const testUtils = {
    dispatchTo,
    render: testRendererForApps,
    rootReducer,
};
