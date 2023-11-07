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

export const isOpenAppOptionsDeviceSN = (
    device: OpenAppOptionsDevice
): device is OpenAppOptionsDeviceSN =>
    (device as OpenAppOptionsDeviceSN).serialNumber !== undefined;

export const isOpenAppOptionsDevicePort = (
    device: OpenAppOptionsDevice
): device is OpenAppOptionsDevicePort =>
    (device as OpenAppOptionsDevicePort).serialPortPath !== undefined;

type OpenAppOptionsDeviceSN = { serialNumber: string };

type OpenAppOptionsDevicePort = { serialPortPath: string };

type OpenAppOptionsDevice = OpenAppOptionsDeviceSN | OpenAppOptionsDevicePort;

export interface OpenAppOptions {
    device?: OpenAppOptionsDevice;
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
