/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Dependency,
    isIncrementalVersion,
    isSemanticVersion,
    isStringVersion,
    SubDependency,
} from './sandboxTypes';

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

type KnownModule = 'nrf-probe-lib' | 'nrfdl' | 'jprog' | 'JlinkARM';

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
