/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

export interface SourceJson {
    name: string;
    apps: string[];
}

export interface AppJson {
    name: string;
    displayName: string;
    description: string;
    homepage?: string;
    iconUrl: string;
    releaseNotesUrl: string;
    latest: string;
    versions: {
        [version: string]: {
            shasum: string;
            tarball: string;
        };
    };
    installed?: {
        path: string;
        shasum: string;
    };
}

interface ObjectContainingOptionalStrings {
    [index: string]: string | undefined;
}

export interface PackageJson {
    name: string;
    version: string;

    // Several optional properties
    author?: string;
    bin?: ObjectContainingOptionalStrings | string;
    dependencies?: ObjectContainingOptionalStrings;
    description?: string;
    homepage?: string;
    devDependencies?: ObjectContainingOptionalStrings;
    displayName?: string;
    engines?: ObjectContainingOptionalStrings;
    files?: readonly string[];
    license?: string;
    main?: string;
    peerDependencies?: ObjectContainingOptionalStrings;
    repository?: {
        type: string;
        url: string;
    };
    scripts?: ObjectContainingOptionalStrings;
}
