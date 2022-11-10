/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* Should work as a wrapper to the SerialPort library 

E.g. should support the same features that is needed from the SerialPort

port.on('open', () => void);
port.on('close', () => void);
port.on('data', () => void);

port.write(data);

*/

import { ipcRenderer } from 'electron';
import { logger } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';
import type { AutoDetectTypes } from '@serialport/bindings-cpp';

export const SerialPort = (options: SerialPortOpenOptions<AutoDetectTypes>) => {
    console.log(options);
    const { path } = options;
    const events = ['open', 'close', 'data'] as const;

    const on = (
        event: typeof events[number],
        callback: (data?: any) => void
    ) => {
        if (event === 'close') {
            ipcRenderer.invoke('serialport:on-close').then(error => {
                if (error) {
                    logger.error(error);
                } else {
                    logger.info(
                        `Successfully closed port with options: ${JSON.stringify(
                            options
                        )}`
                    );
                }
            });
        }
        if (event === 'data') {
            // ipcRenderer.invoke('serialport:data');
            ipcRenderer.on('serialport:data', (_event, data) => callback(data));
        }
    };

    const write = async (
        data: string | number[] | Buffer,
        callback?:
            | ((error: Error | null | undefined, bytesWritten: number) => void)
            | undefined
    ): any => {
        ipcRenderer.invoke('serialport:write', path, data).then(callback);
    };

    const isOpen = (): Promise<boolean> =>
        ipcRenderer.invoke('serialport:isOpen', path);

    const close = () =>
        ipcRenderer
            .invoke('serialport:close', path)
            .then(([error, wasClosed]) => {
                if (error) {
                    logger.error(error);
                } else {
                    if (wasClosed) {
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
                }
            });

    ipcRenderer.invoke('serialport:new', options).then(error => {
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
