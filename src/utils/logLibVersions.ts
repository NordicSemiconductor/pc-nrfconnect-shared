/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib, {
    ModuleVersion,
} from '@nordicsemiconductor/nrf-device-lib-js';

import { getDeviceLibContext } from '../Device/deviceLister';
import logger from '../logging';

// TODO: All these types and the function describeBuggyVersion are just needed
// because the versions in nrf-device-lib-js v0.3.12 are buggy. As soon as we
// upgrade to a version where this is fixed, we can remove all of this.
type Semantic = { major: number; minor: number; patch: number };
type SemanticInVersion = { version?: Semantic };
type SemanticInSemantic = { semantic?: Semantic };
type Incremental = { incremental?: number };
type PlainString = { string?: string };
type BuggyModuleVersion = SemanticInVersion &
    SemanticInSemantic &
    Incremental &
    PlainString;

const describeBuggyVersion = (version: BuggyModuleVersion) => {
    if (version.version)
        return `${version.version.major}.${version.version.minor}.${version.version.patch}`;
    if (version.semantic)
        return `${version.semantic.major}.${version.semantic.minor}.${version.semantic.patch}`;
    if (version.incremental) return version.incremental;
    if (version.string) return version.string;

    return 'Unknown';
};

export const describe = (version?: ModuleVersion) => {
    if (version == null) {
        return 'Unknown';
    }

    if (version.versionFormat == null) {
        return describeBuggyVersion(version);
    }

    switch (version.versionFormat) {
        case 'incremental':
        case 'string':
            return version.version;
        case 'semantic':
            return `${version.version.major}.${version.version.minor}.${version.version.patch}`;
    }
};

const logVersion = (
    versions: ModuleVersion[],
    moduleName: string,
    description: string
) => {
    const version = versions.find(v => v.moduleName === moduleName);
    logger.info(`Using ${description} version: ${describe(version)}`);
};

const logDependency = (
    versions: ModuleVersion[],
    moduleName: string,
    description: string
) => {
    versions.forEach(version => {
        searchForAndLogDependency(version, description, moduleName);
    });
};

const searchForAndLogDependency = (
    version: ModuleVersion,
    description: string,
    name: string
) => {
    if (version.moduleName === name) {
        logger.info(`Using ${description} version: ${describe(version)}`);
        return version;
    }
    // @ts-expect-error -- ModuleVersion type has dependencies now which is a ModuleVersion[]
    return version.dependencies?.map(dep =>
        searchForAndLogDependency(dep, description, name)
    );
};

export default async () => {
    try {
        const versions = await nrfDeviceLib.getModuleVersions(
            getDeviceLibContext()
        );

        logVersion(
            versions,
            'nrfdl-js',
            '@nordicsemiconductor/nrf-device-lib-js'
        );
        logVersion(versions, 'nrfdl', 'nrf-device-lib');
        logDependency(versions, 'jprog', 'nrfjprog dll');
        logDependency(versions, 'jlink', 'JLink');
    } catch (error) {
        logger.logError('Failed to get the library versions', error);
    }
};
