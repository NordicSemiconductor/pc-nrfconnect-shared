/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getModuleVersion } from './deviceLibWrapper';

const exampleModuleVersions = [
    {
        name: 'nrfdl',
        plugins: [
            {
                dependencies: [
                    {
                        dependencies: [
                            {
                                expectedVersion: {
                                    version: 'JLink_V7.66a',
                                    versionFormat: 'string' as const,
                                },
                                name: 'JlinkARM',
                                version: 'JLink_V7.66a',
                                versionFormat: 'string' as const,
                            },
                        ],
                        name: 'jprog',
                        version: {
                            major: 10,
                            metadata: '0',
                            minor: 16,
                            patch: 0,
                            pre: '0',
                        },
                        versionFormat: 'semantic' as const,
                    },
                ],
                name: 'jlink',
                version: {
                    major: 0,
                    metadata: '0',
                    minor: 12,
                    patch: 5,
                    pre: '0',
                },
                versionFormat: 'semantic' as const,
            },
        ],
        version: {
            major: 0,
            metadata: '0',
            minor: 12,
            patch: 5,
            pre: '0',
        },
        versionFormat: 'semantic' as const,
    },
    {
        name: 'nrfdl-js',
        version: {
            major: 0,
            minor: 4,
            patch: 12,
            metadata: '0',
            pre: '0',
        },
        versionFormat: 'semantic' as const,
    },
];

describe('finding module versions', () => {
    test('in the top level modules', () => {
        expect(getModuleVersion('nrfdl-js', exampleModuleVersions)).toEqual({
            name: 'nrfdl-js',
            version: {
                major: 0,
                minor: 4,
                patch: 12,
                metadata: '0',
                pre: '0',
            },
            versionFormat: 'semantic' as const,
        });
    });

    test('in nested dependencies', () => {
        expect(getModuleVersion('JlinkARM', exampleModuleVersions)).toEqual({
            expectedVersion: {
                version: 'JLink_V7.66a',
                versionFormat: 'string' as const,
            },
            name: 'JlinkARM',
            version: 'JLink_V7.66a',
            versionFormat: 'string' as const,
        });
    });
});
