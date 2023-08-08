/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { forRenderer as forRendererAppDetails } from '../ipc/appDetails';
import { forRenderer as forRendererApps } from '../ipc/apps';
import { forRenderer as forRendererOpenWindow } from '../ipc/openWindow';
import { forRenderer as forRendererPreventSleep } from '../ipc/preventSleep';
import {
    forRenderer as forRendererSerialPort,
    inRenderer as inRendererSerialPort,
} from '../ipc/serialPort';

export { registerLauncherWindowFromMain } from '../ipc/infrastructure/mainToRenderer';

export const appDetails = { forRenderer: forRendererAppDetails };
export const apps = { forRenderer: forRendererApps };
export const openWindow = { forRenderer: forRendererOpenWindow };
export const preventSleep = { forRenderer: forRendererPreventSleep };
export const serialPort = {
    inRenderer: inRendererSerialPort,
    forRenderer: forRendererSerialPort,
};

export * from '../ipc/MetaFiles';

export { type OverwriteOptions } from '../ipc/serialPort';
export { type OpenAppOptions } from '../ipc/openWindow';

export { default as prepareSandbox } from '../src/Nrfutil/sandbox';
export { NrfutilSandbox } from '../src/Nrfutil/sandbox';
export type { Progress } from '../src/Nrfutil/sandboxTypes';
