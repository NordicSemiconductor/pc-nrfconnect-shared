/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';

import render from '../../test/testrenderer';
import Dropdown from './Dropdown';

const items = [
    {
        label: 'Foo',
        value: 'foo',
    },
    {
        label: 'Bar',
        value: 'Bar',
    },
];

describe('Dropdown', () => {
    it('shows a list of items', () => {
        render(
            <Dropdown
                items={items}
                onSelect={jest.fn()}
                selectedItem={items[0]}
            />
        );
        expect(screen.getAllByText('Foo').length).toBe(2); // default selected + item
        expect(screen.getByText('Bar')).toBeInTheDocument();
    });

    it('calls onSelect', () => {
        const onSelect = jest.fn();
        const item = items[1];
        render(
            <Dropdown
                items={items}
                onSelect={onSelect}
                selectedItem={items[0]}
            />
        );
        const dropdownItem = screen.getByText(item.label);
        fireEvent.click(dropdownItem);
        expect(onSelect).toHaveBeenCalledWith(item);
    });

    it('selects the correct item', () => {
        render(
            <Dropdown
                items={items}
                onSelect={jest.fn()}
                selectedItem={items[1]}
            />
        );
        expect(screen.getAllByText('Bar').length).toBe(2);
    });
});
