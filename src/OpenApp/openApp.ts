/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron/renderer';

import type { OpenAppOptions } from '../../main';

type AppSpec = { name: string; source: string };

export const openAppWindow = (
    app: AppSpec,
    openAppOptions?: OpenAppOptions
) => {
    ipcRenderer.send('open:app', app, openAppOptions);
};
