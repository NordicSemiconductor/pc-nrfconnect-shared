/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { act, screen } from '@testing-library/react';

import { OFFICIAL } from '../../ipc/sources';
import packageJsonFromShared from '../../package.json';
import render from '../../test/testrenderer';
import App, { Pane } from './App';

jest.mock('../Log/LogViewer', () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock('../logging/index.ts', () => ({
    initialise: () => {},
    debug: () => {},
}));

jest.mock('../utils/packageJson', () => ({
    isLauncher: () => false,
    packageJson: () => packageJsonFromShared,
}));

const appDetails = Promise.resolve({ source: OFFICIAL });
jest.mock('../utils/appDetails', () => ({
    __esModule: true,
    default: () => appDetails,
}));

const renderApp = (panes: Pane[]) => {
    const dummyReducer = (s = null) => s;
    const dummyNode = <div />;

    return render(
        <App
            appReducer={dummyReducer}
            deviceSelect={dummyNode}
            sidePanel={dummyNode}
            panes={panes}
        />,
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
    it('automatically gets an About pane attached', async () => {
        renderApp([aPane, anotherPane]);

        expect(screen.getByText('About')).toBeInTheDocument();

        await act(() => appDetails);
    });
});
