/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ModuleVersion } from '@nordicsemiconductor/nrf-device-lib-js';

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
    if (version.incremental) return String(version.incremental);
    if (version.string) return version.string;

    return 'Unknown';
};

export default (version?: ModuleVersion) => {
    if (version == null) {
        return 'Unknown';
    }

    if (version.versionFormat == null) {
        return describeBuggyVersion(version);
    }

    switch (version.versionFormat) {
        case 'incremental':
        case 'string':
            return String(version.version);
        case 'semantic':
            return `${version.version.major}.${version.version.minor}.${version.version.patch}`;
    }
};
