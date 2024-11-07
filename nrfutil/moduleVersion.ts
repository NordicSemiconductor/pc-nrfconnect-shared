/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { packageJsonApp } from '../src/utils/packageJson';
import {
    Dependency,
    type DiscriminatedVersion,
    SubDependency,
    versionToString,
} from './sandboxTypes';

export const describeVersion = (version?: DiscriminatedVersion | string) => {
    if (typeof version === 'string') return version;
    if (version == null) return 'Unknown';

    return versionToString(version);
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

export const getExpectedVersion = (dependency: Dependency) => {
    const currentVersion = versionToString(dependency);

    const expectedVersion = dependency.expectedVersion
        ? versionToString(dependency.expectedVersion)
        : currentVersion;

    return {
        isExpectedVersion: currentVersion === expectedVersion,
        expectedVersion,
    };
};

export const resolveModuleVersion = (
    module: KnownModule,
    versions: Dependency[] = []
): Dependency | SubDependency | undefined =>
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
    throw new Error(`No version specified for the bundled nrfutil ${module}`);
};

export const versionToInstall = (module: string, version?: string) =>
    version ??
    overriddenVersion(module) ??
    versionFromPackageJson(module) ??
    failToDetermineVersion(module);
