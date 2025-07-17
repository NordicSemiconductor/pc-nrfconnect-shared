/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    convertToDropDownItems,
    convertToNumberDropDownItems,
    getSelectedDropdownItem,
} from './DropdownHelpers';

const itemList = [
    { label: 'foo', value: 'foo' },
    { label: 'bar', value: 'bar' },
];

describe('getSelectedDropdownItem', () => {
    it('returns the first item if value is undefined', () => {
        expect(getSelectedDropdownItem(itemList, undefined)).toBe(itemList[0]);
    });

    it('returns the first item if value is not found', () => {
        expect(getSelectedDropdownItem(itemList, 'unknown')).toBe(itemList[0]);
    });

    it('returns the item with the correct value', () => {
        expect(getSelectedDropdownItem(itemList, 'bar')).toBe(itemList[1]);
    });

    it('returns the item with the correct value when value is a boolean', () => {
        const booleanList = [
            { label: 'on', value: 'on' },
            { label: 'off', value: 'off' },
        ];
        expect(getSelectedDropdownItem(booleanList, true)).toBe(booleanList[0]);
    });

    it('returns the notFound item if value is not found', () => {
        const notFound = { label: 'not found', value: 'not found' };
        expect(getSelectedDropdownItem(itemList, 'unknown', notFound)).toBe(
            notFound
        );
    });
});

describe('convertToDropDownItems', () => {
    it('converts an array of strings to dropdown items', () => {
        const data = ['foo', 'bar'];
        expect(convertToDropDownItems(data)).toEqual([
            { label: 'Default', value: 'undefined' },
            { label: 'foo', value: 'foo' },
            { label: 'bar', value: 'bar' },
        ]);
    });

    it('converts an array of strings to dropdown items without default', () => {
        const data = ['foo', 'bar'];
        expect(convertToDropDownItems(data, false)).toEqual([
            { label: 'foo', value: 'foo' },
            { label: 'bar', value: 'bar' },
        ]);
    });
});

describe('convertToNumberDropDownItems', () => {
    it('converts an array of numbers to dropdown items', () => {
        const data = [1, 2];
        expect(convertToNumberDropDownItems(data)).toEqual([
            { label: '1', value: 1 },
            { label: '2', value: 2 },
        ]);
    });
});
