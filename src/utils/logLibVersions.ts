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
import describeVersion from './describeVersion';

const logVersion = (
    versions: ModuleVersion[],
    moduleName: string,
    description: string
) => {
    versions.forEach(version => {
        findDependency(version, description, moduleName);
    });
};

const findDependency = (
    version: ModuleVersion,
    description: string,
    name: string
) => {
    if (version.moduleName === name) {
        logger.info(
            `Using ${description} version: ${describeVersion(version)}`
        );
        return;
    }

    version.dependencies?.forEach(dep =>
        findDependency(dep, description, name)
    );
};

export default async () => {
    try {
        const versions = await nrfDeviceLib.getModuleVersions(
            getDeviceLibContext()
        );
        const log = (moduleName: string, description: string) =>
            logVersion(versions, moduleName, description);

        log('nrfdl-js', '@nordicsemiconductor/nrf-device-lib-js');
        log('nrfdl', 'nrf-device-lib');
        log('jprog', 'nrfjprog dll');
        log('jlink', 'JLink');

        return versions;
    } catch (error) {
        logger.logError('Failed to get the library versions', error);
    }
};
