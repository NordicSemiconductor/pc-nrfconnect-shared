/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import the electron package.

module.exports = {
    require: jest.fn(),
    match: jest.fn(),
    app: jest.fn(),
    dialog: jest.fn(),
    ipcRenderer: {
        once: jest.fn(),
        send: jest.fn(),
    },
};
