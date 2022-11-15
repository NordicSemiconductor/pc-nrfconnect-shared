/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { ipcRenderer } from 'electron';
import { logger } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

export const SERIALPORT_CHANNEL = {
    OPEN: 'serialport:open',
    CLOSE: 'serialport:close',
    WRITE: 'serialport:write',

    ON_CLOSED: 'serialport:on-close',
    ON_DATA: 'serialport:on-data',

    IS_OPEN: 'serialport:is-open',
};

export const SerialPort = async (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    onData: (data: Uint8Array) => void = () => {},
    onClosed: () => void = () => {}
) => {
    const { path } = options;

    ipcRenderer.on(SERIALPORT_CHANNEL.ON_DATA, (_event, data) => onData(data));
    ipcRenderer.on(SERIALPORT_CHANNEL.ON_CLOSED, onClosed);

    const write = (data: string | number[] | Buffer): void => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.WRITE, path, data);
    };

    const isOpen = (): Promise<boolean> =>
        ipcRenderer.invoke(SERIALPORT_CHANNEL.IS_OPEN, path);

    const close = async () => {
        const [error, wasClosed] = await ipcRenderer.invoke(
            SERIALPORT_CHANNEL.CLOSE,
            path
        );
        if (error) {
            throw new Error(error);
        }

        if (wasClosed) {
            logger.info(`Closed port: ${options.path}`);
        } else {
            logger.info(`Port ${options.path} still in use by other window(s)`);
        }
        return wasClosed;
    };

    const error = await ipcRenderer.invoke(SERIALPORT_CHANNEL.OPEN, options);

    if (error) {
        logger.error(error);
        throw new Error(error);
    } else {
        logger.info(`Opened port with options: ${JSON.stringify(options)}`);
    }

    return { path, write, close, isOpen };
};
