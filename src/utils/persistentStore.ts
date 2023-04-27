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
    serialPortOptions: Omit<SerialPortOpenOptions<AutoDetectTypes>, 'path'>;
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

export const persistNickname = (key: string, nickname: string) =>
    sharedStore.set(`${key}.name`, nickname);
export const getPersistedNickname = (key: string) =>
    sharedStore.get(`${key}.name`, '') as string;

export const persistIsFavorite = (key: string, value: boolean) =>
    sharedStore.set(`${key}.fav`, value);
export const getPersistedIsFavorite = (key: string) =>
    sharedStore.get(`${key}.fav`, false) as boolean;

export const persistSerialPortSettings = (
    key: string,
    serialPortSettings: Omit<SerialSettings, 'lastUpdated'>
) =>
    sharedStore.set(`${key}.${packageJson().name}`, {
        ...serialPortSettings,
        lastUpdated: Date.now(),
    });
export const getPersistedSerialPortSettings = (
    key: string
): SerialSettings | undefined => {
    const appName = packageJson().name;
    logger.info(
        `Getting serialport options from persistent store ${key}.${appName}`
    );
    return sharedStore.get(`${key}.${appName}`);
};
export const persistTerminalSettings = (
    key: string,
    vComIndex: number,
    terminalSettings: TerminalSettings
) =>
    sharedStore.set(
        `${key}.vCom-${vComIndex}.TerminalSettings`,
        terminalSettings
    );
export const getPersistedTerminalSettings = (
    key: string,
    vComIndex: number
): TerminalSettings | undefined => {
    logger.info(
        `Get terminal settings from persistent store ${key}.vCom-${vComIndex}.TerminalSettings`
    );
    return sharedStore.get(`${key}.vCom-${vComIndex}.TerminalSettings`);
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
