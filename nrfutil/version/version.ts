/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

type IncrementalVersion = {
    versionFormat: 'incremental';
    version: number;
};

type SemanticVersion = {
    versionFormat: 'semantic';
    version: {
        major: number;
        minor: number;
        patch: number;
        semverPreNumeric?: number;
        semverPreAlphaNumeric?: number;
        semverMetadataNumeric?: number;
        semverMetadataAlphaNumeric?: number;
    };
};

type StringVersion = {
    versionFormat: 'string';
    version: string;
};

export type DiscriminatedVersion =
    | IncrementalVersion
    | SemanticVersion
    | StringVersion;

export const isSemanticVersion = (
    version?: DiscriminatedVersion,
): version is SemanticVersion => version?.versionFormat === 'semantic';

export const isIncrementalVersion = (
    version?: DiscriminatedVersion,
): version is IncrementalVersion => version?.versionFormat === 'incremental';

export const isStringVersion = (
    version?: DiscriminatedVersion,
): version is StringVersion => version?.versionFormat === 'string';

export const versionToString = (version: DiscriminatedVersion) => {
    if (isSemanticVersion(version)) {
        const semantic = version.version;
        return `${semantic.major}.${semantic.minor}.${semantic.patch}`;
    }

    return String(version.version);
};
