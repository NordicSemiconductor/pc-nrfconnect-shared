/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { forRenderer as forRendererAppDetails } from '../ipc/appDetails';
import { forRenderer as forRendererApps } from '../ipc/apps';
import { forRenderer as forRendererOpenWindow } from '../ipc/openWindow';
import {
    forRenderer as forRendererSerialPort,
    inRenderer as inRendererSerialPort,
} from '../ipc/serialPort';

export const appDetails = {
    forRenderer: forRendererAppDetails,
};

export const apps = { forRenderer: forRendererApps };

export const openWindow = {
    forRenderer: forRendererOpenWindow,
};

export const serialPort = {
    inRenderer: inRendererSerialPort,
    forRenderer: forRendererSerialPort,
};

export * from '../ipc/MetaFiles';

export { type OverwriteOptions } from '../ipc/serialPort';
export { type OpenAppOptions } from '../ipc/openWindow';

export { registerLauncherWindowFromMain } from '../ipc/infrastructure/mainToRenderer';
