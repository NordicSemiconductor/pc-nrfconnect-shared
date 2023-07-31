/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';

import { broadcast, onBroadcasted } from './infrastructure/mainToRenderer';
import {
    handle,
    handleWithSender,
    invoke,
} from './infrastructure/rendererToMain';

const channel = {
    // **************
    // Commands (from the renderer processes of apps to the main process)
    // **************
    open: 'serialport:open',
    close: 'serialport:close',
    write: 'serialport:write',
    update: 'serialport:update',
    set: 'serialport:set',

    // **************
    // Queries (from the renderer processes of apps to the main process)
    // **************
    isOpen: 'serialport:is-open',
    getOptions: 'serialport:get-options',

    // **************
    // Callbacks (from the the main process to the renderer processes of apps)
    // **************
    onClosed: 'serialport:on-close',
    onUpdated: 'serialport:on-update',
    onSet: 'serialport:on-set',
    onChanged: 'serialport:on-changed',

    // Would be nice to rename the next two channels, but we cannot change the
    // string because it would break interoperability between apps and launchers
    onDataReived: 'serialport:on-data',
    onDataWritten: 'serialport:on-write',
};

export type OverwriteOptions = {
    overwrite?: boolean;
    settingsLocked?: boolean;
};

// **************
// Commands (from the renderer processes of apps to the main process)
// **************

type Open = (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    overwriteOptions: OverwriteOptions
) => void;
export const open = invoke<Open>(channel.open);
export const registerOpen = handleWithSender<Open>(channel.open);

type Close = (path: string) => void;
export const close = invoke<Close>(channel.close);
export const registerClose = handleWithSender<Close>(channel.close);

type Write = (path: string, data: string | number[] | Buffer) => void;
export const write = invoke<Write>(channel.write);
export const registerWrite = handle<Write>(channel.write);

type Update = (path: string, options: UpdateOptions) => void;
export const update = invoke<Update>(channel.update);
export const registerUpdate = handle<Update>(channel.update);

type Set = (path: string, set: SetOptions) => void;
export const set = invoke<Set>(channel.set);
export const registerSet = handle<Set>(channel.set);

// **************
// Queries (from the renderer processes of apps to the main process)
// **************

type IsOpen = (path: string) => boolean;
export const isOpen = invoke<IsOpen>(channel.isOpen);
export const registerIsOpen = handle<IsOpen>(channel.isOpen);

type GetOptions = (
    path: string
) => SerialPortOpenOptions<AutoDetectTypes> | undefined;
export const getOptions = invoke<GetOptions>(channel.getOptions);
export const registerGetOptions = handle<GetOptions>(channel.getOptions);

// **************
// Callbacks (from the the main process to the renderer processes of apps)
// **************

type OnDataReceived = (data: unknown) => void;
export const broadcastDataReceived = broadcast<OnDataReceived>(
    channel.onDataReived
);
export const registerOnDataReceived = (path: string) =>
    onBroadcasted<OnDataReceived>(channel.onDataReived, path);

type OnDataWritten = (data: string | number[] | Buffer) => void;
export const broadcastDataWritten = broadcast<OnDataWritten>(
    channel.onDataWritten
);
export const registerOnDataWritten = (path: string) =>
    onBroadcasted<OnDataWritten>(channel.onDataWritten, path);

type OnClosed = () => void;
export const broadcastClosed = broadcast<OnClosed>(channel.onClosed);
export const registerOnClosed = (path: string) =>
    onBroadcasted<OnClosed>(channel.onClosed, path);

type OnUpdate = (newOptions: UpdateOptions) => void;
export const broadcastUpdated = broadcast<OnUpdate>(channel.onUpdated);
export const registerOnUpdated = (path: string) =>
    onBroadcasted<OnUpdate>(channel.onUpdated, path);

type OnSet = (newOptions: SetOptions) => void;
export const broadcastSet = broadcast<OnSet>(channel.onSet);
export const registerOnSet = (path: string) =>
    onBroadcasted<OnSet>(channel.onSet, path);

type OnChanged = (newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void;
export const broadcastChanged = broadcast<OnChanged>(channel.onChanged);
export const registerOnChanged = (path: string) =>
    onBroadcasted<OnChanged>(channel.onChanged, path);
