/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import childProcess from 'child_process';
import { shell } from 'electron';
import fs from 'fs';
import os from 'os';

/**
 * Open a file in the default text application, depending on the user's OS.
 *
 * @param {string} filePath path to the file to open.
 * @returns {void}
 */
function openFile(filePath: string) {
    const exists = fs.existsSync(filePath);
    if (!exists) {
        throw new Error(`Could not find file at path: ${filePath}`);
    }

    const escapedPath = filePath.replace(/ /g, '\\ ');

    // Could not find a method that works on all three platforms:
    // * shell.openItem works on Windows and Linux but not on OSX
    // * childProcess.execSync works on OSX but not on Windows
    if (os.type() === 'Darwin') {
        childProcess.execSync(`open ${escapedPath}`);
    } else {
        shell.openPath(escapedPath);
    }
}

/**
 * Open a URL in the user's default web browser.
 *
 * @param {string} url The URL to open.
 * @returns {void}
 */
function openUrl(url: string) {
    shell.openExternal(url);
}

function openFileLocation(filePath: string) {
    shell.showItemInFolder(filePath);
}

export { openFile, openUrl, openFileLocation };
