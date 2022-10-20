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
        // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
        uuid: require.resolve('uuid'),
    },
    transform: {
        '^.+\\.[jt]sx?$': [
            'babel-jest',
            {
                configFile: `${__dirname}/babel.config.js`,
            },
        ],
    },
    transformIgnorePatterns: ['node_modules/(?!(pc-nrfconnect-shared)/)'],
    setupFilesAfterEnv: [`${__dirname}/../test/setupTests.ts`],
    snapshotSerializers: ['enzyme-to-json/serializer'],

    coverageDirectory: 'coverage/jest-coverage',
    collectCoverage: true,
    coverageReporters: ['json', 'text'],
});
