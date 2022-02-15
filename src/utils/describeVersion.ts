/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ModuleVersion } from '@nordicsemiconductor/nrf-device-lib-js';

export default (version?: ModuleVersion) => {
    if (version == null) {
        return 'Unknown';
    }

    switch (version.versionFormat) {
        case 'incremental':
        case 'string':
            return String(version.version);
        case 'semantic':
            return `${version.version.major}.${version.version.minor}.${version.version.patch}`;
    }
};
