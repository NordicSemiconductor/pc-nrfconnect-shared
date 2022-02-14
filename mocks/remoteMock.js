/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import the electron package.

module.exports = {
    require: jest.fn(),
    getCurrentWindow: () => ({
        reload: jest.fn(),
    }),
};
