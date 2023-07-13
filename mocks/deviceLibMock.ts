/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// TODO
export const createContext = jest.fn().mockReturnValue(1);
export const setTimeoutConfig = jest.fn();
export const startLogEvents = jest.fn();
export const stopLogEvents = jest.fn();
export const setLogLevel = jest.fn();
export const setLogPattern = jest.fn();

export default {
    createContext,
    setTimeoutConfig,
    startLogEvents,
    stopLogEvents,
    setLogLevel,
    setLogPattern,
};
