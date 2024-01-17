/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { BrowserWindow, ipcRenderer, WebContents } from 'electron';

let launcherWindow: BrowserWindow | undefined;

export const registerLauncherWindowFromMain = (window: BrowserWindow) => {
    launcherWindow = window;
};

export const removeLauncherWindowFromMain = () => {
    launcherWindow = undefined;
};

export const send =
    <T extends (...args: never[]) => void>(channel: string) =>
    (...args: Parameters<T>) =>
        launcherWindow?.webContents.send(channel, ...args);

export const on =
    <T extends (...args: never[]) => void>(channel: string) =>
    (handler: T) =>
        ipcRenderer.on(channel, (_event, ...args: unknown[]) =>
            handler(...(args as Parameters<T>))
        );

// Broadcast with a subchannel

export const broadcast =
    <T extends (...args: never[]) => void>(channel: string) =>
    (
        subChannel: string,
        targets: Pick<WebContents, 'send'>[] = [],
        ...args: Parameters<T>
    ) =>
        targets.forEach(target => {
            target.send(`${channel}_${subChannel}`, ...args);
        });

export const onBroadcasted =
    <T extends (...args: never[]) => void>(
        channel: string,
        subChannel: string
    ) =>
    (handler: T) =>
        ipcRenderer.on(
            `${channel}_${subChannel}`,
            (_event, ...args: unknown[]) => handler(...(args as Parameters<T>))
        );
