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

const isDependency = (
    versioned?: Dependency | ModuleVersion
): versioned is Dependency => versioned != null && 'versionFormat' in versioned;

const hasSemanticVersion = (
    versioned?: Dependency | ModuleVersion
): versioned is Dependency & { version: SemanticVersion } =>
    isDependency(versioned) && versioned.versionFormat === 'semantic';

const hasIncrementalVersion = (
    versioned?: Dependency | ModuleVersion
): versioned is Dependency & { version: number } =>
    isDependency(versioned) && versioned.versionFormat === 'incremental';

const hasStringVersion = (
    versioned?: Dependency | ModuleVersion
): versioned is ModuleVersion | (Dependency & { version: string }) =>
    !isDependency(versioned) || versioned.versionFormat === 'string';

export const describeVersion = (dependency?: Dependency | ModuleVersion) => {
    if (hasSemanticVersion(dependency)) {
        return `${dependency.version.major}.${dependency.version.minor}.${dependency.version.patch}`;
    }

    if (hasIncrementalVersion(dependency) || hasStringVersion(dependency)) {
        return String(dependency.version);
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
