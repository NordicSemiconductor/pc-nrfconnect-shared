/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcMain, WebContents } from 'electron';

import { LaunchableApp } from './apps';
import { handleWithSender, invoke } from './infrastructure/rendererToMain';

const channel = {
    request: 'get-app-details',
    response: 'app-details',
};

interface AppDetails {
    coreVersion: string;
    corePath: string;
    homeDir: string;
    tmpDir: string;
    bundledJlink: string;
    path: string;
}

export type AppDetailsFromLauncher = AppDetails & LaunchableApp;

type GetAppDetails = () => AppDetailsFromLauncher;

const getAppDetails = invoke<GetAppDetails>(channel.request);

const registerGetAppDetails = (
    onGetAppDetails: (webContents: WebContents) => AppDetailsFromLauncher,
) => {
    handleWithSender<GetAppDetails>(channel.request)(onGetAppDetails);

    // This legacy implementation is still needed, because we currently still
    // send the corresponding message in apps using shared 76 or earlier.
    // When all apps are updated and required a launcher using shared 77 or
    // later, we can remove this.
    ipcMain.on(channel.request, event => {
        event.sender.send(channel.response, onGetAppDetails(event.sender));
    });
};

export const forRenderer = { registerGetAppDetails };
export const inMain = { getAppDetails };
