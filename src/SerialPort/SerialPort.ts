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
import { logger } from 'pc-nrfconnect-shared';
import type { SerialPortOpenOptions } from 'serialport';

export const SERIALPORT_CHANNEL = {
    OPEN: 'serialport:open',
    CLOSE: 'serialport:close',
    WRITE: 'serialport:write',
    UPDATE: 'serialport:update',
    SET: 'serialport:set',

    ON_CLOSED: 'serialport:on-close',
    ON_DATA: 'serialport:on-data',
    ON_UPDATE: 'serialport:on-update',
    ON_SET: 'serialport:on-set',
    ON_CHANGED: 'serialport:on-changed',

    IS_OPEN: 'serialport:is-open',
};

export const SerialPort = async (
    options: SerialPortOpenOptions<AutoDetectTypes>,
    overwrite: boolean,
    {
        onData = () => {},
        onClosed = () => {},
        onUpdate = () => {},
        onSet = () => {},
        onChange = () => {},
    }: {
        onData?: (data: Uint8Array) => void;
        onClosed?: () => void;
        onUpdate?: (newOptions: UpdateOptions) => void;
        onSet?: (newOptions: SetOptions) => void;
        onChange?: (newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void;
    } = {}
) => {
    const { path } = options;

    ipcRenderer.on(SERIALPORT_CHANNEL.ON_DATA, (_event, data) => onData(data));
    ipcRenderer.on(SERIALPORT_CHANNEL.ON_CLOSED, onClosed);
    ipcRenderer.on(SERIALPORT_CHANNEL.ON_UPDATE, (_event, newOptions) =>
        onUpdate(newOptions)
    );
    ipcRenderer.on(SERIALPORT_CHANNEL.ON_SET, (_event, newOptions) =>
        onSet(newOptions)
    );
    ipcRenderer.on(SERIALPORT_CHANNEL.ON_CHANGED, (_event, newOptions) =>
        onChange(newOptions)
    );

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

    // Only supports baudRate, same as serialport.io
    const update = (newOptions: UpdateOptions) => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.UPDATE, path, newOptions);
    };

    const set = (newOptions: SetOptions) => {
        ipcRenderer.invoke(SERIALPORT_CHANNEL.SET, path, newOptions);
    };

    const response = await ipcRenderer.invoke(
        SERIALPORT_CHANNEL.OPEN,
        options,
        overwrite
    );

    if (response !== 'SUCCESS') {
        logger.error(
            `Failed to connect to port: ${path}. Make sure the port is not already taken, if you are not sure, try to power cycle the device and try to connect again. ${response}`
        );
        throw new Error(response);
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
    };
};
