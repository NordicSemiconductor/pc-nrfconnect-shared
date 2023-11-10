/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import appDetails from '../utils/appDetails';
import { getAppDataDir } from '../utils/appDirs';
import udevInstalled from '../utils/udevInstalled';
import logger from '.';

let initialMessagesSent = false;
export default async () => {
    if (initialMessagesSent) return;
    initialMessagesSent = true;

    logger.debug(`Application data folder: ${getAppDataDir()}`);

    const {
        name,
        currentVersion,
        engineVersion,
        coreVersion,
        corePath,
        installed,
        homeDir,
        tmpDir,
        source,
    } = await appDetails();

    logger.debug(`App ${name} v${currentVersion} (${source})`);
    logger.debug(`App path: ${installed.path}`);
    logger.debug(
        `nRFConnect ${coreVersion}, required by the app is (${engineVersion})`
    );
    logger.debug(`nRFConnect path: ${corePath}`);
    logger.debug(`HomeDir: ${homeDir}`);
    logger.debug(`TmpDir: ${tmpDir}`);

    if (!udevInstalled()) {
        logger.warn(
            'Required component nrf-udev is not detected. Install it from https://github.com/NordicSemiconductor/nrf-udev and restart the application'
        );
    }
};
