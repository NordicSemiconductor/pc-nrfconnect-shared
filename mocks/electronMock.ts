/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// Allows jest to test files that import the electron package.

export const match = jest.fn();
export const app = jest.fn();
export const dialog = jest.fn();
export const ipcRenderer = {
    once: jest.fn(),
    send: jest.fn(),
};
