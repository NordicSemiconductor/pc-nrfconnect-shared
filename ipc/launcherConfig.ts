/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, ipcRenderer } from 'electron';

export interface Configuration {
    isRunningLauncherFromSource: boolean;
    launcherVersion: string;
    userDataDir: string;
}
const channel = 'get-config';

const getConfig = (): Configuration => ipcRenderer.sendSync(channel);
const registerGetConfig = (config: Configuration) =>
    ipcMain.on(channel, event => {
        event.returnValue = config;
    });

export const forRenderer = { registerGetConfig };
export const inMain = { getConfig };
