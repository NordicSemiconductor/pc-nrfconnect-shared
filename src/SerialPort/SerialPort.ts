/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type {
    AutoDetectTypes,
    SetOptions,
    UpdateOptions,
} from '@serialport/bindings-cpp';
import { ipcRenderer } from 'electron';
import EventEmitter from 'events';
import type { SerialPortOpenOptions } from 'serialport';

import { OverwriteOptions, SERIALPORT_CHANNEL } from '../../main';
import logger from '../logging';

export type SerialPort = Awaited<ReturnType<typeof createSerialPort>>;

export const createSerialPort = async (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    overwriteOptions: OverwriteOptions = {
        overwrite: false,
        settingsLocked: false,
    }
) => {
    const { path } = options;
    const eventEmitter = new EventEmitter();
    let closed = false;

    ipcRenderer.on(`${SERIALPORT_CHANNEL.ON_DATA}_${path}`, (_event, data) =>
        eventEmitter.emit('onData', data)
    );
    ipcRenderer.on(`${SERIALPORT_CHANNEL.ON_CLOSED}_${path}`, () => {
        eventEmitter.emit('onClosed');
        closed = true;
    });
    ipcRenderer.on(
        `${SERIALPORT_CHANNEL.ON_UPDATE}_${path}`,
        (_event, newOptions) => eventEmitter.emit('onUpdate', newOptions)
    );
    ipcRenderer.on(
        `${SERIALPORT_CHANNEL.ON_SET}_${path}`,
        (_event, newOptions) => eventEmitter.emit('onSet', newOptions)
    );
    ipcRenderer.on(
        `${SERIALPORT_CHANNEL.ON_CHANGED}_${path}`,
        (_event, newOptions) => eventEmitter.emit('onChange', newOptions)
    );

    // The origin of this event is emitted when a renderer writes to the port.
    ipcRenderer.on(`${SERIALPORT_CHANNEL.ON_WRITE}_${path}`, (_event, data) =>
        eventEmitter.emit('onDataWritten', data)
    );

    const write = (data: string | number[] | Buffer): void => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.WRITE, path, data);
    };

    const isOpen = (): Promise<boolean> =>
        ipcRenderer.invoke(SERIALPORT_CHANNEL.IS_OPEN, path);

    const close = async () => {
        if (closed) return;
        const error = await ipcRenderer.invoke(SERIALPORT_CHANNEL.CLOSE, path);
        if (error) {
            // IPC only carries the error message, that's why we throw new Error.
            throw new Error(error);
        }

        try {
            if (await isOpen()) {
                logger.info(
                    `Port ${options.path} still in use by other window(s)`
                );
            }
        } catch {
            logger.info(`Closed port: ${options.path}`);
        }
    };

    // Only supports baudRate, same as serialport.io
    const update = (newOptions: UpdateOptions) => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.UPDATE, path, newOptions);
    };

    const set = (newOptions: SetOptions) => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.SET, path, newOptions);
    };

    const getOptions = (): Promise<SerialPortOpenOptions<AutoDetectTypes>> =>
        ipcRenderer.invoke(SERIALPORT_CHANNEL.GET_OPTIONS, path);

    const openWithRetries = async (retryCount: number) => {
        try {
            return (await ipcRenderer.invoke(
                SERIALPORT_CHANNEL.OPEN,
                options,
                overwriteOptions
            )) as string;
        } catch (error) {
            if (
                (error as Error).message.includes(
                    'PORT_IS_ALREADY_BEING_OPENED'
                ) &&
                retryCount > 0
            ) {
                return new Promise<string>(resolve => {
                    setTimeout(async () => {
                        resolve(
                            (await openWithRetries(retryCount - 1)) as string
                        );
                    }, 50 + Math.random() * 100);
                });
            }
            return Promise.resolve<string>((error as Error).message);
        }
    };

    const error = await openWithRetries(3);

    if (error) {
        logger.error(
            `Failed to connect to port: ${path}. Make sure the port is not already taken, if you are not sure, try to power cycle the device and try to connect again.`
        );
        throw new Error(error);
    } else {
        logger.info(`Opened port with options: ${JSON.stringify(options)}`);
    }

    return {
        path,
        write,
        close,
        isOpen,
        update,
        set,
        getOptions,
        onData: (handler: (data: Uint8Array) => void) => {
            eventEmitter.on('onData', handler);
            return () => {
                eventEmitter.removeListener('onData', handler);
            };
        },
        onClosed: (handler: () => void) => {
            eventEmitter.on('onClosed', handler);
            return () => {
                eventEmitter.removeListener('onClosed', handler);
            };
        },
        onUpdate: (handler: (newOptions: UpdateOptions) => void) => {
            eventEmitter.on('onUpdate', handler);
            return () => {
                eventEmitter.removeListener('onUpdate', handler);
            };
        },
        onSet: (handler: (newOptions: SetOptions) => void) => {
            eventEmitter.on('onSet', handler);
            return () => {
                eventEmitter.removeListener('onSet', handler);
            };
        },
        onChange: (
            handler: (
                newOptions: SerialPortOpenOptions<AutoDetectTypes>
            ) => void
        ) => {
            eventEmitter.on('onChange', handler);
            return () => {
                eventEmitter.removeListener('onChange', handler);
            };
        },
        onDataWritten: (handler: (data: Uint8Array) => void) => {
            eventEmitter.on('onDataWritten', handler);
            return () => {
                eventEmitter.removeListener('onDataWritten', handler);
            };
        },
    };
};

export const getSerialPortOptions = async (
    path: string
): Promise<SerialPortOpenOptions<AutoDetectTypes> | undefined> => {
    try {
        console.log('will fetch options from path=', path);
        return (await ipcRenderer.invoke(
            SERIALPORT_CHANNEL.GET_OPTIONS,
            path
        )) as SerialPortOpenOptions<AutoDetectTypes> | undefined;
    } catch (error) {
        logger.error(`Failed to get options for port: ${path}`);
    }
};
