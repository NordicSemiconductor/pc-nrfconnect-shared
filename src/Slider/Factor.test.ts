/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { isFactor } from './factor';

describe('Factor', () => {
    it('Test valid integer factors ', () => {
        expect(isFactor(20, 5)).toBe(true);
        expect(isFactor(28, 2)).toBe(true);
        expect(isFactor(27, 3)).toBe(true);
        expect(isFactor(27, 9)).toBe(true);
        expect(isFactor(144, 12)).toBe(true);
        expect(isFactor(21, 7)).toBe(true);
    });

    it('Test invalid integer factors ', () => {
        expect(isFactor(20, 6)).toBe(false);
        expect(isFactor(28, 3)).toBe(false);
        expect(isFactor(27, 4)).toBe(false);
        expect(isFactor(27, 10)).toBe(false);
        expect(isFactor(144, 11)).toBe(false);
        expect(isFactor(21, 8)).toBe(false);
    });

    it('Test valid decimal factors ', () => {
        expect(isFactor(0.15, 0.05)).toBe(true);
        expect(isFactor(0.2331, 0.0001)).toBe(true);
        expect(isFactor(0.22, 0.02)).toBe(true);
        expect(isFactor(0.2, 0.02)).toBe(true);
        expect(isFactor(144.05, 0.01)).toBe(true);
        expect(isFactor(74.8706915963, 37.43534579815)).toBe(true);
        expect(isFactor(0.333333333, 0.3)).toBe(true);
        expect(isFactor(0.2331, 0.1)).toBe(true);
    });

    it('Test invalid decimal factors ', () => {
        expect(isFactor(0.16, 0.05)).toBe(false);
        expect(isFactor(0.2331, 0.0002)).toBe(false);
        expect(isFactor(0.22, 0.03)).toBe(false);
        expect(isFactor(0.2, 0.06)).toBe(false);
        expect(isFactor(144.05, 0.08)).toBe(false);
        expect(isFactor(0.3433333333, 0.03)).toBe(false);
        expect(isFactor(74.8806915963, 37.43534579815)).toBe(false);
    });
});
