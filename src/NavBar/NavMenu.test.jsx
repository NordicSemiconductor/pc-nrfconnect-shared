/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import render from '../../test/testrenderer';
import { setPanes } from '../App/appLayout';
import NavMenu from './NavMenu';

const aPane = {
    name: 'an menu item',
    Main: () => <div>A pane</div>,
};
const anotherPane = {
    name: 'another menu item',
    Main: () => <div>Another pane</div>,
};

expect.extend({
    toBeHighlighted(element) {
        const pass = element.classList.contains('selected');
        const not = pass ? 'not ' : '';
        const message = () =>
            `Expected the element to ${not}contain a class 'selected' to signify that ` +
            `it is ${not}highlighted. It actually contained: ${element.className}`;
        return { pass, message };
    },
});

describe('NavMenu', () => {
    it('displays multiple items', () => {
        const { getByText } = render(<NavMenu />, [
            setPanes([aPane, anotherPane]),
        ]);

        expect(getByText('an menu item')).toBeInTheDocument();
        expect(getByText('another menu item')).toBeInTheDocument();
    });
});
