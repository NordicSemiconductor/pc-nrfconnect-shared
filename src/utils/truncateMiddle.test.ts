/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { truncateMiddle } from './truncateMiddle';

test('truncate strings when necessary', () => {
    expect(
        truncateMiddle('some long string with more than 36 characters')
    ).toBe('some long string wit...36 characters');

    expect(truncateMiddle('short string')).toBe('short string');

    expect(truncateMiddle('string with 20 chars')).toBe('string with 20 chars');

    expect(truncateMiddle('abc123def', 3, 3)).toBe('abc123def');

    expect(truncateMiddle('abc1234efg', 3, 3)).toBe('abc...efg');
});
