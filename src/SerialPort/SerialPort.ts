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
    OPEN_PORT: 'serialport:new',
    DO_CLOSE: 'serialport:close',
    HAVE_CLOSED: 'serialport:on-close',
    RECEIVED_DATA: 'serialport:data',
    WRITE: 'serialport:write',
    IS_OPEN: 'serialport:isOpen',
};

export const SerialPort = (options: SerialPortOpenOptions<AutoDetectTypes>) => {
    const { path } = options;
    const events = ['open', 'close', 'data'] as const;

    const on = (
        event: typeof events[number],
        callback: (data?: unknown) => void
    ) => {
        if (event === 'close') {
            ipcRenderer.on(SERIALPORT_CHANNEL.HAVE_CLOSED, () => {
                logger.info(
                    `I GOT THE EVENT: Successfully closed serialport with options: ${JSON.stringify(
                        options
                    )}`
                );
            });
        }
        if (event === 'data') {
            ipcRenderer.on(SERIALPORT_CHANNEL.RECEIVED_DATA, (_event, data) =>
                callback(data)
            );
        }
    };
    const write = (data: string | number[] | Buffer): void => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.WRITE, path, data);
    };

    const isOpen = (): Promise<boolean> =>
        ipcRenderer.invoke(SERIALPORT_CHANNEL.IS_OPEN, path);

    const close = () =>
        ipcRenderer
            .invoke(SERIALPORT_CHANNEL.DO_CLOSE, path)
            .then(([error, wasClosed]) => {
                if (error) {
                    logger.error(error);
                } else if (wasClosed) {
                    logger.info(
                        `Successfully closed port with options: ${JSON.stringify(
                            options
                        )}`
                    );
                } else {
                    logger.info(
                        `Process no longer subscribing to port with options: ${JSON.stringify(
                            options
                        )}, but port is still open.`
                    );
                }
            });

    ipcRenderer.invoke(SERIALPORT_CHANNEL.OPEN_PORT, options).then(error => {
        if (error) {
            logger.error(error);
        } else {
            logger.info(
                `Successfully opened port with options: ${JSON.stringify(
                    options
                )}`
            );
        }
    });

    return { path, on, write, close, isOpen };
};
