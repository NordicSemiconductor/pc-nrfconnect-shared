/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import describeError from '../../src/logging/describeError';
import { getNrfutilLogger } from '../nrfutilLogger';
import { getJlinkCompatibility } from '../version/jlinkVersion';
import {
    type Dependency,
    describeVersion,
    findDependency,
    type ModuleVersion,
} from '../version/moduleVersion';

const log = (
    description: string,
    dependencyOrVersion?: Dependency | string
) => {
    const logger = getNrfutilLogger();
    if (dependencyOrVersion == null) {
        logger?.warn(`Unable to detect version of ${description}.`);
    } else {
        logger?.info(
            `Using ${description} version: ${describeVersion(
                dependencyOrVersion
            )}`
        );
    }
};

export default (moduleVersion: ModuleVersion) => {
    const logger = getNrfutilLogger();
    try {
        const dependencies = moduleVersion.dependencies;

        log('nrfutil-device', moduleVersion.version);
        log('nrf-device-lib', findDependency('nrfdl', dependencies));
        log('nrf-probe', findDependency('nrf-probe', dependencies));
        log('JLink', findDependency('JlinkARM', dependencies));

        const jlinkCompatibility = getJlinkCompatibility(moduleVersion);

        switch (jlinkCompatibility.kind) {
            case 'No J-Link installed':
                logger?.warn(
                    `SEGGER J-Link is not installed. ` +
                        `Install at least version ${jlinkCompatibility.requiredJlink} ` +
                        `from https://www.segger.com/downloads/jlink`
                );
                break;
            case 'Outdated J-Link':
                logger?.warn(
                    `Outdated SEGGER J-Link. Your version of SEGGER J-Link (${jlinkCompatibility.actualJlink}) ` +
                        `is older than the one this app was tested with (${jlinkCompatibility.requiredJlink}). ` +
                        `Install the newer version from https://www.segger.com/downloads/jlink`
                );
                break;
            case 'Newer J-Link is used':
                logger?.info(
                    `Your version of SEGGER J-Link (${jlinkCompatibility.actualJlink}) ` +
                        `is newer than the one this app was tested with (${jlinkCompatibility.requiredJlink}). ` +
                        `The tested version is not required, and your J-Link version will most likely work fine.` +
                        ` If you get issues related to J-Link with your devices, use the tested version.`
                );
                break;
        }
    } catch (error) {
        logger?.error(
            `Failed to get the library versions${
                error != null ? `: ${describeError(error)}` : ''
            }`
        );
    }
};
