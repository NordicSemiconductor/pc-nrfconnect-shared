/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import classNames from './classNames';

describe('classNames', () => {
    it('combines multiple class names with a space', () => {
        expect(classNames('button', 'important')).toBe('button important');
    });

    it('filters out non strings', () => {
        expect(
            classNames(
                'button',
                true,
                false,
                null,
                undefined,
                [],
                {},
                () => {},
                'important'
            )
        ).toBe('button important');
    });
});
