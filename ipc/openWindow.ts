/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AppSpec } from './apps';
import { on, send } from './infrastructure/rendererToMain';

const channel = {
    app: 'open:app',
    launcher: 'open-app-launcher', // It would be nice to call this `open:launcher` but we have to stick to the current name, because that is used by supported apps.
};

export interface OpenAppOptions {
    device?: { serialNumber: string } | { serialPortPath: string };
}

type OpenApp = (app: AppSpec, openAppOptions?: OpenAppOptions) => void;
const openApp = send<OpenApp>(channel.app);
const registerOpenApp = on<OpenApp>(channel.app);

type OpenLauncher = () => void;
const openLauncher = send<OpenLauncher>(channel.launcher);
const registerOpenLauncher = on<OpenLauncher>(channel.launcher);

export const forRenderer = {
    registerOpenApp,
    registerOpenLauncher,
};

export const inMain = {
    openApp,
    openLauncher,
};
