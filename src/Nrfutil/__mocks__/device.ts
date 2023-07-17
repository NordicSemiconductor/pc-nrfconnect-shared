/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const getDeviceLib = () =>
    Promise.resolve({
        program: jest.fn(),
        programBuffer: jest.fn(),
        erase: jest.fn(),
        recover: jest.fn(),
        reset: jest.fn(),
        getProtectionStatus: jest.fn(),
        setProtectionStatus: jest.fn(),
        fwInfo: jest.fn(),
        setMcuState: jest.fn(),
        coreInfo: jest.fn(),
        list: jest.fn(() => ({
            stop: jest.fn(),
        })),
        firmwareRead: jest.fn(),
        onLogging: jest.fn(),
        setLogLevel: jest.fn(),
        setVerboseLogging: jest.fn(),
        getModuleVersion: jest.fn(),
    });

export default getDeviceLib;
