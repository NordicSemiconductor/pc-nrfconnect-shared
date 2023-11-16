/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { flatObject } from './usageData';

describe('flatObject', () => {
    it('is an empty object for nullish input', () => {
        expect(flatObject(null)).toEqual({});
        expect(flatObject(undefined)).toEqual({});
    });

    it('is an empty object for primitives', () => {
        expect(flatObject(true)).toEqual({});
        expect(flatObject(false)).toEqual({});
        expect(flatObject(0)).toEqual({});
        expect(flatObject(1)).toEqual({});
        expect(flatObject(NaN)).toEqual({});
        expect(flatObject(Symbol(''))).toEqual({});
    });

    it('flattens typical objects', () => {
        expect(
            flatObject({
                top: true,
                nested: { once: 1 },
                and: { nested: { by: { multiple: 'levels' } } },
            })
        ).toEqual({
            top: true,
            'nested.once': 1,
            'and.nested.by.multiple': 'levels',
        });
    });
});
