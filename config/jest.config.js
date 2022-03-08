/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

module.exports = (
    subDir = '/node_modules/pc-nrfconnect-shared',
    disabledMocks = []
) => ({
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$': `<rootDir>${subDir}/mocks/fileMock.ts`,
        '\\.(css|scss)$': `<rootDir>${subDir}/mocks/emptyMock.ts`,
        packageJson$: `<rootDir>${subDir}/mocks/packageJsonMock.ts`,
        'pc-ble-driver-js': `<rootDir>${subDir}/mocks/bleDriverMock.ts`,
        'pc-nrfjprog-js|nrf-device-setup|usb': `<rootDir>${subDir}/mocks/emptyMock.ts`,
        '^electron$': `<rootDir>${subDir}/mocks/electronMock.ts`,
        '^electron-store$': `<rootDir>${subDir}/mocks/electronStoreMock.ts`,
        '@nordicsemiconductor/nrf-device-lib-js': `<rootDir>${subDir}/mocks/deviceLibMock.ts`,
        '@electron/remote': `<rootDir>${subDir}/mocks/remoteMock.ts`,
        ...(disabledMocks.includes('react-ga')
            ? {}
            : { '^react-ga$': `<rootDir>${subDir}/mocks/gaMock.ts` }),
        ...(disabledMocks.includes('serialport')
            ? {}
            : { serialport: `<rootDir>${subDir}/mocks/emptyMock.ts` }),
    },
    transform: {
        '^.+\\.[jt]sx?$': [
            'babel-jest',
            {
                configFile: `.${subDir}/config/babel.config.js`,
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!(pc-nrfconnect-shared)/)'],
    setupFilesAfterEnv: [`<rootDir>${subDir}/test/setupTests.ts`],
});
