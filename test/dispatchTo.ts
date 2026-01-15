/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type Action, type Reducer } from 'redux';

const initAction = {
    type: '@@INIT',
};

export default <State>(aReducer: Reducer<State>, actions: Action[] = []) => {
    const state = [initAction, ...actions].reduce(aReducer, undefined);

    if (state === undefined) {
        throw new Error(
            'Redux is broken, after dispatchig actions, the state must never be undefined.',
        );
    }

    return state;
};
