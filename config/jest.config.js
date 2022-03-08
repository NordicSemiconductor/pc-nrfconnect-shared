/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = () => ({
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/fileMock.ts',
        '\\.(css|scss)$':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/emptyMock.ts',
        packageJson$:
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/packageJsonMock.ts',
        'pc-ble-driver-js':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/bleDriverMock.ts',
        'pc-nrfjprog-js|nrf-device-setup|serialport|usb':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/emptyMock.ts',
        '^electron$':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/electronMock.ts',
        '^electron-store$':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/electronStoreMock.ts',
        '^react-ga$':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/gaMock.ts',
        '@nordicsemiconductor/nrf-device-lib-js':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/deviceLibMock.ts',
        '@electron/remote':
            '<rootDir>/node_modules/pc-nrfconnect-shared/mocks/remoteMock.ts',
    },
    transform: {
        '^.+\\.[jt]sx?$': [
            'babel-jest',
            {
                configFile:
                    './node_modules/pc-nrfconnect-shared/config/babel.config.js',
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!(pc-nrfconnect-shared)/)'],
    setupFilesAfterEnv: [
        '<rootDir>/node_modules/pc-nrfconnect-shared/test/setupTests.ts',
    ],
});
