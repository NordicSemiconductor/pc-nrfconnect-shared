/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import rootReducer from '../src/rootReducer';
import dispatchTo from './dispatchTo';
import { testRendererForApps } from './testrenderer';

export const testUtils = {
    dispatchTo,
    render: testRendererForApps,
    rootReducer,
};
