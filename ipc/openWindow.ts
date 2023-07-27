/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { on, send } from './infrastructure/rendererToMain';

const channel = {
    app: 'open:app',
    launcher: 'open-app-launcher', // It would be nice to call this `open:launcher` but we have to stick to the current name, because that is used by supported apps.
};

export interface AppSpec {
    name: string;
    source: string;
}

export interface OpenAppOptions {
    device?: { serialNumber: string; serialPortPath?: string };
}

// open app
type OpenApp = (app: AppSpec, openAppOptions?: OpenAppOptions) => void;

export const openApp = send<OpenApp>(channel.app);
export const registerOpenApp = on<OpenApp>(channel.app);

// open launcher

type OpenLauncher = () => void;

export const openLauncher = send<OpenLauncher>(channel.launcher);
export const registerOpenLauncher = on<OpenLauncher>(channel.launcher);
