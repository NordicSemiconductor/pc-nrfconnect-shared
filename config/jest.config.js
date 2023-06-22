/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const path = require('path');

const mockDir = path.join(__dirname, '..', 'mocks');

module.exports = (disabledMocks = []) => ({
    testEnvironment: 'jsdom',
    moduleNameMapper: {
        '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)$': `${mockDir}/fileMock.ts`,
        '\\.(css|scss)$': `${mockDir}/emptyMock.ts`,
        'pc-nrfjprog-js|nrf-device-setup|usb': `${mockDir}/emptyMock.ts`,
        '^electron$': `${mockDir}/electronMock.ts`,
        '^electron-store$': `${mockDir}/electronStoreMock.ts`,
        '@nordicsemiconductor/nrf-device-lib-js': `${mockDir}/deviceLibMock.ts`,
        '@electron/remote': `${mockDir}/remoteMock.ts`,
        'react-markdown':
            '<rootDir>/node_modules/react-markdown/react-markdown.min.js',
        ...(disabledMocks.includes('packageJson')
            ? {}
            : {
                  packageJson$: `${mockDir}/packageJsonMock.ts`,
              }),
        ...(disabledMocks.includes('react-ga')
            ? {}
            : { '^react-ga$': `${mockDir}/gaMock.ts` }),
        ...(disabledMocks.includes('serialport')
            ? {}
            : { serialport: `${mockDir}/emptyMock.ts` }),
    },
    transform: {
        '^.+\\.[jt]sx?$': '@swc/jest',
    },
    transformIgnorePatterns: ['node_modules/(?!(pc-nrfconnect-shared)/)'],
    setupFilesAfterEnv: [`${__dirname}/../test/setupTests.ts`],
    resolver: `${__dirname}/../test/jestResolver.js`,
    modulePathIgnorePatterns: ['dist'],
});
