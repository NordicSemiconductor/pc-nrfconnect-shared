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
    overwriteOptions: OverwriteOptions,
) => void;
const open = invoke<Open>(channel.open);
const registerOpen = handleWithSender<Open>(channel.open);

type Close = (path: string) => void;
const close = invoke<Close>(channel.close);
const registerClose = handleWithSender<Close>(channel.close);

type Write = (path: string, data: string | number[] | Buffer) => void;
const write = invoke<Write>(channel.write);
const registerWrite = handle<Write>(channel.write);

type Update = (path: string, options: UpdateOptions) => void;
const update = invoke<Update>(channel.update);
const registerUpdate = handle<Update>(channel.update);

type Set = (path: string, set: SetOptions) => void;
const set = invoke<Set>(channel.set);
const registerSet = handle<Set>(channel.set);

// **************
// Queries (from the renderer processes of apps to the main process)
// **************

type IsOpen = (path: string) => boolean;
const isOpen = invoke<IsOpen>(channel.isOpen);
const registerIsOpen = handle<IsOpen>(channel.isOpen);

type GetOptions = (
    path: string,
) => SerialPortOpenOptions<AutoDetectTypes> | undefined;
const getOptions = invoke<GetOptions>(channel.getOptions);
const registerGetOptions = handle<GetOptions>(channel.getOptions);

// **************
// Callbacks (from the the main process to the renderer processes of apps)
// **************

type OnDataReceived = (data: unknown) => void;
const broadcastDataReceived = broadcast<OnDataReceived>(channel.onDataReived);
const registerOnDataReceived = (path: string) =>
    onBroadcasted<OnDataReceived>(channel.onDataReived, path);

type OnDataWritten = (data: string | number[] | Buffer) => void;
const broadcastDataWritten = broadcast<OnDataWritten>(channel.onDataWritten);
const registerOnDataWritten = (path: string) =>
    onBroadcasted<OnDataWritten>(channel.onDataWritten, path);

type OnClosed = () => void;
const broadcastClosed = broadcast<OnClosed>(channel.onClosed);
const registerOnClosed = (path: string) =>
    onBroadcasted<OnClosed>(channel.onClosed, path);

type OnUpdate = (newOptions: UpdateOptions) => void;
const broadcastUpdated = broadcast<OnUpdate>(channel.onUpdated);
const registerOnUpdated = (path: string) =>
    onBroadcasted<OnUpdate>(channel.onUpdated, path);

type OnSet = (newOptions: SetOptions) => void;
const broadcastSet = broadcast<OnSet>(channel.onSet);
const registerOnSet = (path: string) =>
    onBroadcasted<OnSet>(channel.onSet, path);

type OnChanged = (newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void;
const broadcastChanged = broadcast<OnChanged>(channel.onChanged);
const registerOnChanged = (path: string) =>
    onBroadcasted<OnChanged>(channel.onChanged, path);

export const inRenderer = {
    broadcastChanged,
    broadcastClosed,
    broadcastDataReceived,
    broadcastDataWritten,
    broadcastSet,
    broadcastUpdated,
};

export const forRenderer = {
    registerClose,
    registerGetOptions,
    registerIsOpen,
    registerOpen,
    registerSet,
    registerUpdate,
    registerWrite,
};

export const inMain = {
    open,
    close,
    write,
    update,
    set,
    isOpen,
    getOptions,
};

export const forMain = {
    registerOnDataReceived,
    registerOnDataWritten,
    registerOnClosed,
    registerOnUpdated,
    registerOnSet,
    registerOnChanged,
};
