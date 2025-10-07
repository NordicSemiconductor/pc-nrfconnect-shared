/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import the electron-store package.

export default jest.fn(() => {
    const cache = new Map();
    return {
        get: jest.fn(
            (key: string, defaultValue?: unknown) =>
                cache.get(key) ?? defaultValue,
        ),
        set: jest.fn(cache.set.bind(cache)),
        clear: jest.fn(cache.clear.bind(cache)),
    };
});
