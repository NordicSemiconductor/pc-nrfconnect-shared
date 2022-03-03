/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import Store from 'electron-store';

import packageJson from './packageJson';

const sharedStore = new Store<{
    verboseLogging: boolean;
    isSendingUsageData: boolean | undefined;
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

export const persistIsSendingUsageData = (value: boolean) =>
    sharedStore.set('isSendingUsageData', value);
export const getIsSendingUsageData = () =>
    sharedStore.get('isSendingUsageData', undefined) as boolean | undefined;
export const deleteIsSendingUsageData = () =>
    sharedStore.delete('isSendingUsageData');

export const persistVerboseLoggingEnabled = (value: boolean) =>
    sharedStore.set('verboseLogging', value);
export const getVerboseLoggingEnabled = () =>
    sharedStore.get('verboseLogging', false);

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
        appSpecificStore = new Store({ name: packageJson().name });
    }

    return appSpecificStore as Store<
        StoreSchema | SharedAppSpecificStoreSchema
    >;
};

export const persistCurrentPane = (currentPane: number) =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().set(
        `currentPane`,
        currentPane
    );
export const getPersistedCurrentPane = () =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().get(`currentPane`);
