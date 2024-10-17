/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    convertToDropDownItems,
    convertToNumberDropDownItems,
    getSelectedDropdownItem,
} from './dataConstructors';

describe('getSelectedDropdownItem', () => {
    it('returns the first item if value is undefined', () => {
        const itemList = [{ label: 'foo', value: 'foo' }];
        expect(getSelectedDropdownItem(itemList, undefined)).toBe(itemList[0]);
    });

    it('returns the first item if value is not found', () => {
        const itemList = [{ label: 'foo', value: 'foo' }];
        expect(getSelectedDropdownItem(itemList, 'bar')).toBe(itemList[0]);
    });

    it('returns the item with the correct value', () => {
        const itemList = [
            { label: 'foo', value: 'foo' },
            { label: 'bar', value: 'bar' },
        ];
        expect(getSelectedDropdownItem(itemList, 'bar')).toBe(itemList[1]);
    });

    it('returns the item with the correct value when value is a boolean', () => {
        const itemList = [
            { label: 'on', value: 'on' },
            { label: 'off', value: 'off' },
        ];
        expect(getSelectedDropdownItem(itemList, true)).toBe(itemList[0]);
    });

    it('returns the notFound item if value is not found', () => {
        const itemList = [{ label: 'foo', value: 'foo' }];
        const notFound = { label: 'not found', value: 'not found' };
        expect(getSelectedDropdownItem(itemList, 'bar', notFound)).toBe(
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
