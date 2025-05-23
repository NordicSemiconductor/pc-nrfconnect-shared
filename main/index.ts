/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { forRenderer as forRendererAppDetails } from '../ipc/appDetails';
import { forRenderer as forRendererApps } from '../ipc/apps';
import { forRenderer as forRendererLauncherConfig } from '../ipc/launcherConfig';
import { forRenderer as forRendererOpen } from '../ipc/open';
import { forRenderer as forRendererPreventSleep } from '../ipc/preventSleep';
import { forRenderer as forRendererSafeStorage } from '../ipc/safeStorage';
import {
    forRenderer as forRendererSerialPort,
    inRenderer as inRendererSerialPort,
} from '../ipc/serialPort';

export {
    registerLauncherWindowFromMain,
    removeLauncherWindowFromMain,
} from '../ipc/infrastructure/mainToRenderer';

export const appDetails = { forRenderer: forRendererAppDetails };
export const apps = { forRenderer: forRendererApps };
export const launcherConfig = { forRenderer: forRendererLauncherConfig };
export const open = { forRenderer: forRendererOpen };
export const preventSleep = { forRenderer: forRendererPreventSleep };
export const safeStorage = {
    forRenderer: forRendererSafeStorage,
};
export const serialPort = {
    inRenderer: inRendererSerialPort,
    forRenderer: forRendererSerialPort,
};

export {
    sourceJsonSchema,
    withdrawnJsonSchema,
    type AppInfo,
    type NrfutilModuleName,
    type NrfutilModules,
    type NrfutilModuleVersion,
    type SourceJson,
    type WithdrawnJson,
} from '../ipc/MetaFiles';
export {
    type PackageJsonLegacyApp,
    type PackageJsonApp,
    parsePackageJsonLegacyApp,
    parsePackageJsonApp,
} from '../ipc/schema/packageJson';

export { type OverwriteOptions } from '../ipc/serialPort';
export type { OpenAppOptions } from '../ipc/open';
export {
    isOpenAppOptionsDevicePort,
    isOpenAppOptionsDeviceSN,
} from '../ipc/open';
