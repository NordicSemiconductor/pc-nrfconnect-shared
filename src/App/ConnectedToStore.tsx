/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { type Reducer } from 'redux';

import store from '../store';

export default ({
    appReducer,
    children,
}: {
    appReducer?: Reducer;
    children: ReactNode;
}) => <Provider store={store(appReducer)}>{children}</Provider>;
