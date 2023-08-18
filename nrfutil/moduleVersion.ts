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
    dependencies: Dependency[];
    name: string;
    versionFormat: VersionFormat;
    version: VersionType;
};

type Dependency = {
    classification?: FeatureClassification;
    name: string;
    plugins?: Plugin[];
    dependencies?: SubDependency[];
    versionFormat: VersionFormat;
    version: VersionType;
};

type VersionType = SemanticVersion | string | number;

export interface SubDependency {
    name: string;
    description?: string;
    dependencies?: SubDependency[];
    versionFormat: VersionFormat;
    version: VersionType;
}

export type ModuleVersion = {
    build_timestamp: string;
    classification: FeatureClassification;
    commit_date: string;
    commit_hash: string;
    dependencies: Dependency[];
    host: string;
    name: string;
    version: string;
};

const isSemanticVersion = (
    version?: SubDependency
): version is SubDependency & { version: SemanticVersion } =>
    version?.versionFormat === 'semantic';

const isIncrementalVersion = (
    version?: SubDependency
): version is SubDependency & { version: number } =>
    version?.versionFormat === 'incremental';

const isStringVersion = (
    version?: SubDependency
): version is SubDependency & { version: string } =>
    version?.versionFormat === 'string';

export const describeVersion = (version?: SubDependency | string) => {
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

type KnownModule = 'nrfdl' | 'jprog' | 'JlinkARM';

const findTopLevel = (module: KnownModule, dependencies: Dependency[]) =>
    dependencies.find(dependency => dependency.name === module);

const findInDependencies = (
    module: KnownModule,
    dependencies: Dependency[]
) => {
    if (dependencies.length > 0) {
        return resolveModuleVersion(
            module,
            dependencies.flatMap(dependency => [
                ...(dependency.dependencies ?? []),
                ...(dependency.plugins?.flatMap(
                    plugin => plugin.dependencies
                ) ?? []),
            ])
        );
    }
};

export const resolveModuleVersion = (
    module: KnownModule,
    versions: Dependency[] = []
): Dependency | SubDependency | undefined =>
    findTopLevel(module, versions) ?? findInDependencies(module, versions);

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
