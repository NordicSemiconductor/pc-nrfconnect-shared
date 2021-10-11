/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { fireEvent } from '@testing-library/react';

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
    it('renders a list of items', () => {
        const { getByText, getAllByText } = render(
            <Dropdown items={items} onSelect={jest.fn()} />
        );
        expect(getAllByText('Foo').length).toBe(2); // default selected + item
        expect(getByText('Bar')).toBeInTheDocument();
    });

    it('calls onSelect when item is clicked', () => {
        const onSelect = jest.fn();
        const item = items[1];
        const { getByText } = render(
            <Dropdown items={items} onSelect={onSelect} />
        );
        const dropdownItem = getByText(item.label);
        fireEvent.click(dropdownItem);
        expect(onSelect).toHaveBeenCalledWith(item);
    });
});
