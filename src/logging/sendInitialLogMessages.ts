/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { inMain as appDetails } from '../../ipc/appDetails';
import NrfutilDeviceLib from '../Nrfutil/device/device';
import {
    describeVersion,
    resolveModuleVersion,
} from '../Nrfutil/moduleVersion';
import { getAppDataDir } from '../utils/appDirs';
import logLibVersions from '../utils/logLibVersions';
import udevInstalled from '../utils/udevInstalled';
import logger from '.';

let initialMessagesSent = false;
export default async () => {
    if (initialMessagesSent) return;
    initialMessagesSent = true;

    logLibVersions();
    logger.debug(`Application data folder: ${getAppDataDir()}`);

    const details = await appDetails.getAppDetails();

    const {
        name,
        currentVersion,
        engineVersion,
        coreVersion,
        corePath,
        installed,
        homeDir,
        tmpDir,
        bundledJlink,
        source,
    } = details;

    logger.debug(`App ${name} v${currentVersion} (${source})`);
    logger.debug(`App path: ${installed.path}`);
    logger.debug(
        `nRFConnect ${coreVersion}, required by the app is (${engineVersion})`
    );
    logger.debug(`nRFConnect path: ${corePath}`);
    logger.debug(`HomeDir: ${homeDir}`);
    logger.debug(`TmpDir: ${tmpDir}`);

    if (bundledJlink) {
        const dependencies = (await NrfutilDeviceLib.getModuleVersion())
            .dependencies;
        const jlinkVersion = resolveModuleVersion('JlinkARM', dependencies);

        if (!describeVersion(jlinkVersion).includes(bundledJlink)) {
            logger.info(
                `Installed JLink version does not match the provided version (${bundledJlink})`
            );
        }
    }

    if (!udevInstalled()) {
        logger.warn(
            'Required component nrf-udev is not detected. Install it from https://github.com/NordicSemiconductor/nrf-udev and restart the application'
        );
    }
};
