/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import packageJson from '../src/utils/packageJson';

type FeatureClassification =
    | 'nrf-internal-confidential'
    | 'nrf-internal'
    | 'nrf-external-confidential'
    | 'nrf-external';

export interface SemanticVersion {
    major: number;
    minor: number;
    patch: number;
    semverPreNumeric?: number;
    semverPreAlphaNumeric?: number;
    semverMetadataNumeric?: number;
    semverMetadataAlphaNumeric?: number;
}

type VersionFormat = 'incremental' | 'semantic' | 'string';

type Plugin = {
    dependencies: TopLevelDependency[];
    name: string;
    versionFormat: VersionFormat;
    version: VersionType;
};

interface TopLevelDependency extends Dependency {
    classification?: FeatureClassification;
    plugins?: Plugin[];
}

type VersionType = SemanticVersion | string | number;

export interface Dependency {
    name: string;
    description?: string;
    dependencies?: Dependency[];
    versionFormat: VersionFormat;
    version: VersionType;
}

export type ModuleVersion = {
    build_timestamp: string;
    classification: FeatureClassification;
    commit_date: string;
    commit_hash: string;
    dependencies: TopLevelDependency[];
    host: string;
    name: string;
    version: string;
};

const isSemanticVersion = (
    version?: Dependency
): version is Dependency & { version: SemanticVersion } =>
    version?.versionFormat === 'semantic';

const isIncrementalVersion = (
    version?: Dependency
): version is Dependency & { version: number } =>
    version?.versionFormat === 'incremental';

const isStringVersion = (
    version?: Dependency
): version is Dependency & { version: string } =>
    version?.versionFormat === 'string';

export const describeVersion = (version?: Dependency | string) => {
    if (typeof version === 'string') {
        return version;
    }

    if (isSemanticVersion(version)) {
        return `${version.version.major}.${version.version.minor}.${version.version.patch}`;
    }

    if (isIncrementalVersion(version) || isStringVersion(version)) {
        return String(version.version);
    }

    return 'Unknown';
};

type KnownDependencies = 'nrfdl' | 'jprog' | 'JlinkARM';

const findTopLevel = (
    dependencyName: KnownDependencies,
    dependencies: TopLevelDependency[]
) => dependencies.find(dependency => dependency.name === dependencyName);

const findInDependencies = (
    dependencyName: KnownDependencies,
    dependencies: TopLevelDependency[]
) => {
    if (dependencies.length > 0) {
        return findDependency(
            dependencyName,
            dependencies.flatMap(dependency => [
                ...(dependency.dependencies ?? []),
                ...(dependency.plugins?.flatMap(
                    plugin => plugin.dependencies
                ) ?? []),
            ])
        );
    }
};

export const findDependency = (
    dependencyName: KnownDependencies,
    versions: TopLevelDependency[] = []
): Dependency | undefined =>
    findTopLevel(dependencyName, versions) ??
    findInDependencies(dependencyName, versions);

const getOverriddenVersion = (module: string) => {
    const allowOverride =
        process.env.NODE_ENV !== 'production' ||
        !!process.env.NRF_OVERRIDE_NRFUTIL_SETTINGS;

    return allowOverride
        ? process.env[`NRF_OVERRIDE_VERSION_${module.toLocaleUpperCase()}`]
        : undefined;
};

const getVersionFromPackageJson = (module: string) => {
    const moduleVersions =
        packageJson().nrfConnectForDesktop?.nrfutil?.[module];

    if (moduleVersions?.[0] == null) {
        throw new Error(`No version specified for nrfutil-${module}`);
    }

    return moduleVersions[0];
};

export const getRequiredNrfutilModuleVersion = (module: string) =>
    getOverriddenVersion(module) ?? getVersionFromPackageJson(module);
