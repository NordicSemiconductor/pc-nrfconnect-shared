/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron';

import { getModuleVersion } from '../Device/deviceLibWrapper';
import getDeviceLib from '../Nrfutil/device';
import { getAppDataDir } from '../utils/appDirs';
import describeVersion from '../utils/describeVersion';
import logLibVersions from '../utils/logLibVersions';
import logger from '.';

let initialMessagesSent = false;
export default () => {
    if (initialMessagesSent) return;
    initialMessagesSent = true;

    logLibVersions();
    logger.debug(`Application data folder: ${getAppDataDir()}`);

    ipcRenderer.once('app-details', async (_event, details) => {
        const {
            name,
            currentVersion,
            engineVersion,
            coreVersion,
            corePath,
            isOfficial,
            installed,
            homeDir,
            tmpDir,
            bundledJlink,
        } = details;

        const official = isOfficial ? 'official' : 'local';

        logger.debug(`App ${name} v${currentVersion} ${official}`);
        logger.debug(`App path: ${installed.path}`);
        logger.debug(
            `nRFConnect ${coreVersion}, required by the app is (${engineVersion})`
        );
        logger.debug(`nRFConnect path: ${corePath}`);
        logger.debug(`HomeDir: ${homeDir}`);
        logger.debug(`TmpDir: ${tmpDir}`);

        if (bundledJlink) {
            const deviceLib = await getDeviceLib();
            const dependencies = (await deviceLib.getModuleVersion())
                .dependencies;
            const jlinkVersion = getModuleVersion('JlinkARM', dependencies);

            if (!describeVersion(jlinkVersion).includes(bundledJlink)) {
                logger.info(
                    `Installed JLink version does not match the provided version (${bundledJlink})`
                );
            }
        }
    });
    ipcRenderer.send('get-app-details');
};
