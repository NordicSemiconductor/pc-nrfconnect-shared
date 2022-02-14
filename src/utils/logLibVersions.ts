/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getModuleVersions,
    ModuleVersion,
} from '@nordicsemiconductor/nrf-device-lib-js';

import {
    getDeviceLibContext,
    getModuleVersion,
} from '../Device/deviceLibWrapper';
import logger from '../logging';
import describeVersion from './describeVersion';

const log = (description: string, moduleVersion?: ModuleVersion) => {
    if (moduleVersion == null) {
        logger.warn(`Unable to detect version of ${description}.`);
    } else {
        logger.info(
            `Using ${description} version: ${describeVersion(moduleVersion)}`
        );
    }
};

export default async () => {
    try {
        const versions = await getModuleVersions(getDeviceLibContext());

        log('nrf-device-lib-js', getModuleVersion('nrfdl-js', versions));
        log('nrf-device-lib', getModuleVersion('nrfdl', versions));
        log('nrfjprog DLL', getModuleVersion('jprog', versions));
        log('JLink', getModuleVersion('jlink', versions));
    } catch (error) {
        logger.logError('Failed to get the library versions', error);
    }
};
