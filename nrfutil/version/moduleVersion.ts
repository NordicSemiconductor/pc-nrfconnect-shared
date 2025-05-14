/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { isLauncher, packageJsonApp } from '../../src/utils/packageJson';
import { type DiscriminatedVersion, versionToString } from './version';

type FeatureClassification =
    | 'nrf-internal-confidential'
    | 'nrf-internal'
    | 'nrf-external-confidential'
    | 'nrf-external';

type Plugin = DiscriminatedVersion & {
    dependencies: TopLevelDependency[];
    name: string;
};

type DependencyWithoutVersion = {
    name: string;
    description?: string;
    dependencies?: Dependency[];
    expectedVersion?: DiscriminatedVersion;
};
type DependencyWithVersion = DiscriminatedVersion & DependencyWithoutVersion;

export type Dependency = DependencyWithoutVersion | DependencyWithVersion;

type TopLevelDependency = Dependency & {
    classification?: FeatureClassification;
    plugins?: Plugin[];
};

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

export const hasVersion = (
    dependency?: Dependency | DiscriminatedVersion
): dependency is DependencyWithVersion | DiscriminatedVersion =>
    dependency != null && 'version' in dependency && dependency.version != null;

export const describeVersion = (dependencyOrVersion?: Dependency | string) => {
    if (typeof dependencyOrVersion === 'string') return dependencyOrVersion;
    if (hasVersion(dependencyOrVersion))
        return versionToString(dependencyOrVersion);

    return 'Unknown';
};

type KnownModule = 'nrfdl' | 'nrf-probe' | 'JlinkARM';

const findTopLevel = (module: KnownModule, dependencies: Dependency[]) =>
    dependencies.find(dependency => dependency.name === module);

const findInDependencies = (
    module: KnownModule,
    dependencies: TopLevelDependency[]
) => {
    if (dependencies.length > 0) {
        return findDependency(
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

export const getExpectedVersion = (dependency: Dependency) => {
    if (!hasVersion(dependency)) return null;

    const currentVersion = versionToString(dependency);

    const expectedVersion = dependency.expectedVersion
        ? versionToString(dependency.expectedVersion)
        : currentVersion;

    return {
        isExpectedVersion: currentVersion === expectedVersion,
        expectedVersion,
    };
};

export const findDependency = (
    module: KnownModule,
    versions: TopLevelDependency[] = []
): Dependency | undefined =>
    findTopLevel(module, versions) ?? findInDependencies(module, versions);

const overriddenVersion = (module: string) => {
    const env = { ...process.env };
    if (
        process.env.NODE_ENV !== 'production' ||
        (process.env.NODE_ENV === 'production' &&
            !!process.env.NRF_OVERRIDE_NRFUTIL_SETTINGS)
    ) {
        return env[`NRF_OVERRIDE_VERSION_${module.toLocaleUpperCase()}`];
    }
};

const versionFromPackageJson = (module: string) =>
    packageJsonApp().nrfConnectForDesktop.nrfutil?.[module][0];

const failToDetermineVersion = (module: string) => {
    throw new Error(`No version specified for nrfutil ${module}`);
};

export const versionToInstall = (module: string, version?: string) =>
    version ??
    overriddenVersion(module) ??
    versionFromPackageJson(module) ??
    failToDetermineVersion(module);

const coreVersionFromPackageJson = () =>
    isLauncher()
        ? undefined // Will lead to using CORE_VERSION_FOR_LEGACY_APPS
        : packageJsonApp().nrfConnectForDesktop.nrfutilCore ??
          failToDetermineVersion('core');

export const coreVersionsToInstall = (coreVersion?: string) =>
    coreVersion ?? overriddenVersion('core') ?? coreVersionFromPackageJson();
