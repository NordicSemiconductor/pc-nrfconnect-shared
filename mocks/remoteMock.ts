/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import the electron package.

export const dialog = jest.fn();
export const getCurrentWindow = () => ({
    reload: jest.fn(),

    getTitle: () => 'Not launcher',

    on: jest.fn(),
});
export const app = {
    getAppPath: () => process.cwd(),
};
