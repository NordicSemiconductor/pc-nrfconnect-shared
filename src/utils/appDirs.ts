/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getGlobal } from '@electron/remote';
import path from 'path';

import packageJson from './packageJson';

const getUserDataDir = () => getGlobal('userDataDir');

/**
 * Get the filesystem path of the currently loaded app.
 *
 * @returns {string|undefined} Absolute path of current app.
 */
function getAppDir() {
    const html = packageJson()?.nrfConnectForDesktop?.html ?? '';
    return __filename.replace(html, '');
}

/**
 * Get the filesystem path of a file for the currently loaded app.
 *
 * @param {string} filename relative name of file in the app directory
 * @returns {string|undefined} Absolute path of file.
 */
function getAppFile(filename: string) {
    return path.resolve(getAppDir(), filename);
}

/**
 * Get the filesystem path of the data directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
function getAppDataDir() {
    return `${getUserDataDir()}${path.basename(getAppDir())}`;
}

/**
 * Get the filesystem path of the log directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
function getAppLogDir() {
    return `${getAppDataDir()}/logs`;
}

export { getAppDir, getAppFile, getAppDataDir, getAppLogDir, getUserDataDir };
