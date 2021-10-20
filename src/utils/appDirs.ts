/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { remote } from 'electron';
import path from 'path';

import { loadPackageJson } from './packageJson';

const getUserDataDir = () => remote.getGlobal('userDataDir');

let appDir: string;
let appDataDir: string;
let appLogDir: string;

function setAppDirs(
    newAppDir: string,
    newAppDataDir: string,
    newAppLogDir: string
) {
    appDir = newAppDir;
    appDataDir = newAppDataDir;
    appLogDir = newAppLogDir;

    loadPackageJson(getAppFile('package.json'));
}

/**
 * Get the filesystem path of the currently loaded app.
 *
 * @returns {string|undefined} Absolute path of current app.
 */
function getAppDir() {
    return appDir;
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
    return appDataDir;
}

/**
 * Get the filesystem path of the log directory of currently loaded app.
 *
 * @returns {string|undefined} Absolute path of data directory of the current app.
 */
function getAppLogDir() {
    return appLogDir;
}

export {
    setAppDirs,
    getAppDir,
    getAppFile,
    getAppDataDir,
    getAppLogDir,
    getUserDataDir,
};
