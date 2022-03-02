/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getModuleVersion } from './deviceLibWrapper';

const exampleModuleVersions = [
    {
        dependencies: [
            {
                dependencies: [
                    {
                        expectedVersion: {
                            version: 'JLink_V7.58b',
                            versionFormat: 'string' as const,
                        },
                        moduleName: 'jlink',
                        version: 'JLink_V7.56a',
                        versionFormat: 'string' as const,
                    },
                ],
                moduleName: 'jprog',
                version: {
                    major: 10,
                    metadata: '0',
                    minor: 15,
                    patch: 1,
                    pre: '0',
                },
                versionFormat: 'semantic' as const,
            },
        ],
        moduleName: 'nrfdl',
        version: {
            major: 0,
            metadata: '0',
            minor: 10,
            patch: 3,
            pre: '0',
        },
        versionFormat: 'semantic' as const,
    },
    {
        moduleName: 'nrfdl-js',
        version: {
            major: 0,
            minor: 4,
            patch: 3,
            metadata: '0',
            pre: '0',
        },
        versionFormat: 'semantic' as const,
    },
];

describe('finding module versions', () => {
    test('in the top level modules', () => {
        expect(getModuleVersion('nrfdl-js', exampleModuleVersions)).toEqual({
            moduleName: 'nrfdl-js',
            version: {
                major: 0,
                minor: 4,
                patch: 3,
                metadata: '0',
                pre: '0',
            },
            versionFormat: 'semantic' as const,
        });
    });

    test('in nested dependencies', () => {
        expect(getModuleVersion('jlink', exampleModuleVersions)).toEqual({
            expectedVersion: {
                version: 'JLink_V7.58b',
                versionFormat: 'string' as const,
            },
            moduleName: 'jlink',
            version: 'JLink_V7.56a',
            versionFormat: 'string' as const,
        });
    });
});
