/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Dependency } from '../Nrfutil/sandboxTypes';
import { getModuleVersion } from './deviceLibWrapper';

const exampleModuleVersions: Dependency[] = [
    {
        classification: 'nrf-external',
        name: 'nrfdl',
        plugins: [
            {
                dependencies: [
                    {
                        dependencies: [
                            {
                                name: 'JlinkARM',
                                version: 'JLink_V7.66a',
                                versionFormat: 'string',
                            },
                        ],
                        name: 'jprog',
                        version: {
                            major: 10,
                            minor: 16,
                            patch: 0,
                        },
                        versionFormat: 'semantic',
                    },
                ],
                name: 'jlink',
                version: {
                    major: 0,
                    minor: 12,
                    patch: 5,
                },
                versionFormat: 'semantic' as const,
            },
        ],
        version: {
            major: 0,
            minor: 12,
            patch: 5,
        },
        versionFormat: 'semantic' as const,
    },
    {
        name: 'nrfdl-js',
        version: {
            major: 0,
            minor: 4,
            patch: 12,
        },
        versionFormat: 'semantic' as const,
    },
];

describe('finding module versions', () => {
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
