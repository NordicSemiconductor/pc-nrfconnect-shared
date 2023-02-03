/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import Store from 'electron-store';
import { SerialPortOpenOptions } from 'serialport';
import { v4 as uuid } from 'uuid';

import logger from '../logging';
import packageJson from './packageJson';

export interface SerialSettings {
    serialPortOptions: SerialPortOpenOptions<AutoDetectTypes>;
    lastUpdated: number;
    vComIndex: number;
}

export interface TerminalSettings {
    lineMode: boolean;
    echoOnShell: boolean;
    lineEnding: string;
    clearOnSend: boolean;
}

const sharedStore = new Store<{
    verboseLogging: boolean;
    isSendingUsageData: boolean | undefined;
    clientId?: string;
}>({
    name: 'pc-nrfconnect-shared',
});

export const persistNickname = (serialNumber: string, nickname: string) =>
    sharedStore.set(`${serialNumber}.name`, nickname);
export const getPersistedNickname = (serialNumber: string) =>
    sharedStore.get(`${serialNumber}.name`, '') as string;

export const persistIsFavorite = (serialNumber: string, value: boolean) =>
    sharedStore.set(`${serialNumber}.fav`, value);
export const getPersistedIsFavorite = (serialNumber: string) =>
    sharedStore.get(`${serialNumber}.fav`, false) as boolean;

export const persistSerialPort = (
    serialNumber: string,
    serialPortOptions: SerialPortOpenOptions<AutoDetectTypes>,
    vComIndex: number
) =>
    sharedStore.set(`${serialNumber}.${packageJson().name}`, {
        serialPortOptions,
        lastUpdated: Date.now(),
        vComIndex,
    } as SerialSettings);
export const getPersistedSerialPort = (
    serialNumber: string
): SerialSettings | undefined => {
    const appName = packageJson().name;
    logger.info(
        `Getting serialport options from persistent store ${serialNumber}.${appName}`
    );
    return sharedStore.get(`${serialNumber}.${appName}`);
};
export const persistTerminalSettings = (
    serialNumber: string,
    vComIndex: number,
    terminalSettings: TerminalSettings
) =>
    sharedStore.set(
        `${serialNumber}.vCom-${vComIndex}.TerminalSettings`,
        terminalSettings
    );
export const getPersistedTerminalSettings = (
    serialNumber: string,
    vComIndex: number
): TerminalSettings | undefined => {
    logger.info(
        `Get terminal settings from persistent store ${serialNumber}.${vComIndex}.TerminalSettings`
    );
    return sharedStore.get(
        `${serialNumber}.vCom-${vComIndex}.TerminalSettings`
    );
};

export const persistIsSendingUsageData = (value: boolean) =>
    sharedStore.set('isSendingUsageData', value);
export const getIsSendingUsageData = () =>
    sharedStore.get('isSendingUsageData', undefined) as boolean | undefined;
export const deleteIsSendingUsageData = () =>
    sharedStore.delete('isSendingUsageData');

const existingUsageDataClientId = () => sharedStore.get('clientId');
const newUsageDataClientId = () => {
    const clientId = uuid();
    sharedStore.set('clientId', clientId);

    return clientId;
};
export const getUsageDataClientId = () =>
    existingUsageDataClientId() ?? newUsageDataClientId();

export const persistIsLoggingVerbose = (value: boolean) =>
    sharedStore.set('isLoggingVerbose', value);
export const getIsLoggingVerbose = () =>
    sharedStore.get('isLoggingVerbose', false);

// This one must be initialised lazily, because the package.json is not read yet when this module is initialised.
// This can probably be changed when we bundle shared with the apps.
let appSpecificStore: Store | undefined;

interface SharedAppSpecificStoreSchema {
    currentPane?: number;
}

export const getAppSpecificStore = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StoreSchema extends Record<string, any>
>() => {
    if (appSpecificStore == null) {
        appSpecificStore = new Store({
            name: packageJson().name,
            clearInvalidConfig: true,
        });
    }

    return appSpecificStore as Store<
        StoreSchema & SharedAppSpecificStoreSchema
    >;
};

export const persistCurrentPane = (currentPane: number) =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().set(
        `currentPane`,
        currentPane
    );
export const getPersistedCurrentPane = () =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().get(`currentPane`);
