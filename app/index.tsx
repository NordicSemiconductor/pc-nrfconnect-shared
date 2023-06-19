/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { createSlice } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

import { App } from '../src';
import BoilerplateDeviceSelector from './BoilerplateDeviceSelector';
import ComponentsPage from './features/components/Components';
import SidePanel from './SidePanel';

import './index.scss';

const reducer = combineReducers({
    hello: createSlice({ initialState: {}, name: 'hello', reducers: {} })
        .reducer,
});

const EmptyDiv = () => <div />;

export default () => (
    <App
        appReducer={reducer}
        deviceSelect={<BoilerplateDeviceSelector />}
        sidePanel={<SidePanel />}
        panes={[
            { name: 'Components', Main: ComponentsPage },
            {
                name: 'Empty Pane',
                Main: EmptyDiv,
            },
        ]}
    />
);
