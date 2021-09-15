/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../test/testrenderer';
import App from './App';

const renderApp = panes => {
    const dummyReducer = (s = null) => s;
    const dummyNode = <div />;

    return render(
        <App
            appReducer={dummyReducer}
            deviceSelect={dummyNode}
            sidePanel={dummyNode}
            panes={panes}
        />
    );
};

const aPane = {
    name: 'an menu item',
    Main: () => <div>A pane</div>,
};
const anotherPane = {
    name: 'another menu item',
    Main: () => <div>Another pane</div>,
};

describe('App', () => {
    it('automatically gets an About pane attached', () => {
        const { getByText } = renderApp([aPane, anotherPane]);

        expect(getByText('About')).toBeInTheDocument();
    });
});
