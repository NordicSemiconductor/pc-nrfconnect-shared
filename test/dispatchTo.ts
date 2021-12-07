/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Action, Reducer } from 'redux';

export default <State>(
    aReducer: Reducer<State>,
    actions: [Action, ...Action[]]
) => {
    const state = actions.reduce(aReducer, undefined);

    if (state === undefined) {
        throw new Error(
            'Redux is broken, after dispatchig actions, the state must never be undefined.'
        );
    }

    return state;
};
