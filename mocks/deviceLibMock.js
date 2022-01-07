/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export default {
    createContext: jest.fn().mockReturnValue(1),
    setTimeoutConfig: jest.fn(),
    startLogEvents: jest.fn(),
    stopLogEvents: jest.fn(),
    setLogLevel: jest.fn(),
    setLogPattern: jest.fn(),
};
