/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getModuleVersions } from '@nordicsemiconductor/nrf-device-lib-js';
import { ipcRenderer } from 'electron';

import {
    getDeviceLibContext,
    getModuleVersion,
} from '../Device/deviceLibWrapper';
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
            path,
            homeDir,
            tmpDir,
            bundledJlink,
        } = details;
        const official = isOfficial ? 'official' : 'local';
        logger.debug(`App ${name} v${currentVersion} ${official}`);
        logger.debug(`App path: ${path}`);
        logger.debug(
            `nRFConnect ${coreVersion}, required by the app is (${engineVersion})`
        );
        logger.debug(`nRFConnect path: ${corePath}`);
        logger.debug(`HomeDir: ${homeDir}`);
        logger.debug(`TmpDir: ${tmpDir}`);

        if (bundledJlink) {
            const versions = await getModuleVersions(getDeviceLibContext());
            let jlinkVersion;
            try {
                jlinkVersion = getModuleVersion('JlinkARM', versions);
            } catch {
                jlinkVersion = getModuleVersion('jlink', versions);
            }
            if (!describeVersion(jlinkVersion).includes(bundledJlink)) {
                logger.info(
                    `Installed JLink version does not match the provided version (${bundledJlink})`
                );
            }
        }
    });
    ipcRenderer.send('get-app-details');
};
