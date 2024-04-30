/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { screen } from '@testing-library/react';

import render from '../../test/testrenderer';
import {
    setCurrentPane,
    setPaneDisabled,
    setPaneHidden,
    setPanes,
} from '../App/appLayout';
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
        render(<NavMenu />, [setPanes([aPane, anotherPane])]);

        expect(screen.getByText('an menu item')).toBeInTheDocument();
        expect(screen.getByText('another menu item')).toBeInTheDocument();
    });

    it('shows the selected item', () => {
        render(<NavMenu />, [setPanes([aPane, anotherPane])]);

        expect(screen.getByText('an menu item')).toBeHighlighted();
        expect(screen.getByText('another menu item')).not.toBeHighlighted();
    });

    it('reacts to changing the selected item', () => {
        render(<NavMenu />, [
            setPanes([aPane, anotherPane]),
            setCurrentPane('another menu item'),
        ]);

        expect(screen.getByText('an menu item')).not.toBeHighlighted();
        expect(screen.getByText('another menu item')).toBeHighlighted();
    });

    it('hides prehidden items', () => {
        render(<NavMenu />, [
            setPanes([{ ...aPane, preHidden: true }, anotherPane]),
        ]);

        expect(screen.queryByText('an menu item')).not.toBeInTheDocument();
        expect(screen.getByText('another menu item')).toBeInTheDocument();
    });

    it('reacts to hiding items', () => {
        render(<NavMenu />, [
            setPanes([aPane, anotherPane]),
            setPaneHidden({ name: aPane.name, hidden: true }),
        ]);

        expect(screen.queryByText('an menu item')).not.toBeInTheDocument();
        expect(screen.getByText('another menu item')).toBeInTheDocument();
        expect(screen.getByText('another menu item')).toBeHighlighted();
    });

    it('disables preDisabled items', () => {
        render(<NavMenu />, [
            setPanes([{ ...aPane, preDisabled: true }, anotherPane]),
        ]);

        expect(screen.getByText('an menu item')).not.toBeEnabled();
        expect(screen.getByText('another menu item')).toBeInTheDocument();
        expect(screen.getByText('another menu item')).toBeHighlighted();
    });

    it('reacts to disabling items', () => {
        render(<NavMenu />, [
            setPanes([aPane, anotherPane]),
            setPaneDisabled({ name: aPane.name, disabled: true }),
        ]);

        expect(screen.getByText('an menu item')).not.toBeEnabled();
        expect(screen.getByText('another menu item')).toBeInTheDocument();
        expect(screen.getByText('another menu item')).toBeHighlighted();
    });
});
