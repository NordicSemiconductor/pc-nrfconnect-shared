/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ipcRenderer } from 'electron';

import { OverwriteOptions, SERIALPORT_CHANNEL } from '../../main';
import { SerialPort } from './SerialPort';

jest.mock('electron', () => ({
    ipcRenderer: { invoke: jest.fn(), on: jest.fn(), send: jest.fn() },
}));

const defaultOptions = { path: '/dev/ROBOT', baudRate: 115200 };

test('SerialPort is initialized with the correct setup', async () => {
    const port = await SerialPort(defaultOptions);

    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        SERIALPORT_CHANNEL.OPEN,
        defaultOptions,
        { overwrite: false, settingsLocked: false }
    );

    expect(port.path).toBe(defaultOptions.path);
});

test('SerialPort may be initialized with overwrite and settingsLocked', async () => {
    let overwriteOptions: OverwriteOptions = { overwrite: true };
    await SerialPort(defaultOptions, overwriteOptions);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        SERIALPORT_CHANNEL.OPEN,
        defaultOptions,
        overwriteOptions
    );

    overwriteOptions = { settingsLocked: true };
    await SerialPort(defaultOptions, overwriteOptions);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        SERIALPORT_CHANNEL.OPEN,
        defaultOptions,
        overwriteOptions
    );

    overwriteOptions = { settingsLocked: true, overwrite: true };
    await SerialPort(defaultOptions, overwriteOptions);
    expect(ipcRenderer.invoke).toHaveBeenCalledWith(
        SERIALPORT_CHANNEL.OPEN,
        defaultOptions,
        overwriteOptions
    );
});
