/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AppSpec } from './apps';
import { handle, invoke, on, send } from './infrastructure/rendererToMain';

const channel = {
    app: 'open:app',
    launcher: 'open-app-launcher', // It would be nice to call this `open:launcher` but we have to stick to the current name, because that is used by supported apps.
    file: 'open:file',
    url: 'open:url',
    fileLocation: 'open:file-location',
};

// app
export const isOpenAppOptionsDeviceSN = (
    device: OpenAppOptionsDevice,
): device is OpenAppOptionsDeviceSN =>
    (device as OpenAppOptionsDeviceSN).serialNumber !== undefined;

export const isOpenAppOptionsDevicePort = (
    device: OpenAppOptionsDevice,
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

// launcher
type OpenLauncher = () => void;
const openLauncher = send<OpenLauncher>(channel.launcher);
const registerOpenLauncher = on<OpenLauncher>(channel.launcher);

// file
// Open a file in the default text application, depending on the user's OS.
type OpenFile = (filePath: string) => void;
const openFile = invoke<OpenFile>(channel.file);
const registerOpenFile = handle<OpenFile>(channel.file);

// URL
// Open a URL in the user's default web browser.
type OpenUrl = (url: string) => void;
const openUrl = invoke<OpenUrl>(channel.url);
const registerOpenUrl = handle<OpenUrl>(channel.url);

// file location
type OpenFileLocation = (filePath: string) => void;
const openFileLocation = invoke<OpenFileLocation>(channel.fileLocation);
const registerOpenFileLocation = handle<OpenFileLocation>(channel.fileLocation);

export const forRenderer = {
    registerOpenApp,
    registerOpenLauncher,
    registerOpenFile,
    registerOpenUrl,
    registerOpenFileLocation,
};

export const inMain = {
    openApp,
    openLauncher,
    openFile,
    openUrl,
    openFileLocation,
};
