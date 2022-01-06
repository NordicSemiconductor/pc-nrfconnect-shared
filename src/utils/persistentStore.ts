/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

import packageJson from './packageJson';

const sharedStore = new Store({ name: 'pc-nrfconnect-shared' });

export const persistNickname = (serialNumber: string, nickname: string) =>
    sharedStore.set(`${serialNumber}.name`, nickname);
export const getPersistedNickname = (serialNumber: string) =>
    sharedStore.get(`${serialNumber}.name`, '') as string;

export const persistIsFavorite = (serialNumber: string, value: boolean) =>
    sharedStore.set(`${serialNumber}.fav`, value);
export const getPersistedIsFavorite = (serialNumber: string) =>
    sharedStore.get(`${serialNumber}.fav`, false) as boolean;

export const persistIsSendingUsageData = (value: boolean) =>
    sharedStore.set('isSendingUsageData', value);
export const getIsSendingUsageData = () =>
    sharedStore.get('isSendingUsageData', undefined) as boolean | undefined;
export const deleteIsSendingUsageData = () =>
    sharedStore.delete('isSendingUsageData');

export const persistExtendedLoggingEnabled = (value: boolean) =>
    sharedStore.set('extendedLogging', value);
export const getExtendedLoggingEnabled = () =>
    sharedStore.get('extendedLogging', false);

// This one must be initialised lazily, because the package.json is not read yet when this module is initialised
let appSpecificStore: Store | undefined;

interface sharedAppSpecificStoreSchema {
    currentPane?: number;
}

export const getAppSpecificStore = <StoreSchema>() => {
    if (appSpecificStore == null) {
        appSpecificStore = new Store({ name: packageJson().name });
    }

    return appSpecificStore as Store<
        StoreSchema | sharedAppSpecificStoreSchema
    >;
};

export const persistCurrentPane = (currentPane: number) =>
    getAppSpecificStore<sharedAppSpecificStoreSchema>().set(
        `currentPane`,
        currentPane
    );
export const getPersistedCurrentPane = () =>
    getAppSpecificStore<sharedAppSpecificStoreSchema>().get(`currentPane`);
