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
import EventEmitter from 'events';
import type { SerialPortOpenOptions } from 'serialport';

import {
    close,
    getOptions,
    isOpen,
    open,
    OverwriteOptions,
    registerOnChanged,
    registerOnClosed,
    registerOnDataReceived,
    registerOnDataWritten,
    registerOnSet,
    registerOnUpdated,
    set,
    update,
    write,
} from '../../ipc/serialPort';
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

    registerOnDataReceived(path)(data => eventEmitter.emit('onData', data));
    registerOnDataWritten(path)(data =>
        eventEmitter.emit('onDataWritten', data)
    );

    registerOnClosed(path)(() => {
        eventEmitter.emit('onClosed');
        closed = true;
    });
    registerOnUpdated(path)(newOptions =>
        eventEmitter.emit('onUpdate', newOptions)
    );
    registerOnSet(path)(newOptions => eventEmitter.emit('onSet', newOptions));
    registerOnChanged(path)(newOptions =>
        eventEmitter.emit('onChange', newOptions)
    );

    const closePort = async () => {
        if (closed) return;
        await close(path);

        try {
            if (await isOpen(path)) {
                logger.info(
                    `Port ${options.path} still in use by other window(s)`
                );
            }
        } catch {
            logger.info(`Closed port: ${options.path}`);
        }
    };

    const openWithRetries = async (retryCount: number) => {
        try {
            return await open(options, overwriteOptions);
        } catch (error) {
            if (
                (error as Error).message.includes(
                    'PORT_IS_ALREADY_BEING_OPENED'
                ) &&
                retryCount > 0
            ) {
                return new Promise<void | string>(resolve => {
                    setTimeout(async () => {
                        resolve(await openWithRetries(retryCount - 1));
                    }, 50 + Math.random() * 100);
                });
            }
            return (error as Error).message;
        }
    };

    const error = await openWithRetries(3);

    if (error) {
        if (error.includes('FAILED_DIFFERENT_SETTINGS')) {
            logger.warn(
                `Failed to connect to port: ${path}. Port is open with different settings.`
            );
        } else {
            logger.error(
                `Failed to connect to port: ${path}. Make sure the port is not already taken, if you are not sure, try to power cycle the device and try to connect again.`
            );
        }
        throw new Error(error);
    } else {
        logger.info(`Opened port with options: ${JSON.stringify(options)}`);
    }

    return {
        path,

        close: closePort,
        write: (data: string | number[] | Buffer) => write(path, data),
        update: (newOptions: UpdateOptions) => update(path, newOptions), // Only supports baudRate, same as serialport.io
        set: (newOptions: SetOptions) => set(path, newOptions),

        isOpen: () => isOpen(path),
        getOptions: () => getOptions(path),

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

export const getSerialPortOptions = async (path: string) => {
    try {
        console.log('will fetch options from path=', path);

        return await getOptions(path);
    } catch (error) {
        logger.error(`Failed to get options for port: ${path}`);
    }
};
