/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import the electron-store package.

export default jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    clear: jest.fn(),
}));
