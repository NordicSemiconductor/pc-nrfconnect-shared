/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import Store from 'electron-store';
import { SerialPortOpenOptions } from 'serialport';
import { v4 as uuid } from 'uuid';

import { inMain as safeStorage } from '../../ipc/safeStorage';
import { type Device } from '../Device/deviceSlice';
import logger from '../logging';
import { packageJson } from './packageJson';

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
    isSendingTelemetry: boolean | undefined;
    clientId?: string;
}>({
    name: 'pc-nrfconnect-shared',
});

/* These nicknames are also read by the VS Code extension,
  so changing e.g. the keys here would break the usage there. */
export const persistNickname = (serialNumber: string, nickname: string) =>
    sharedStore.set(`${serialNumber}.name`, nickname);
export const getPersistedNickname = (serialNumber: string) =>
    sharedStore.get(`${serialNumber}.name`, '') as string;

export const persistIsFavorite = (serialNumber: string, value: boolean) =>
    sharedStore.set(`${serialNumber}.fav`, value);
export const getPersistedIsFavorite = (serialNumber: string) =>
    sharedStore.get(`${serialNumber}.fav`, false) as boolean;

export const persistApiKey = async (keyName: string, apiKey: string) => {
    const canEncrypt = await safeStorage.isEncryptionAvailable();
    if (!canEncrypt) {
        throw new Error('Encryption not available');
    }

    const encrypted = await safeStorage.encryptString(apiKey);
    sharedStore.set(`apiKeys.${keyName}`, Array.from(encrypted));
};
export const getPersistedApiKey = async (keyName: string) => {
    const canDecrypt = await safeStorage.isEncryptionAvailable();
    if (!canDecrypt) {
        throw new Error('Decryption not available');
    }

    const encrypted = sharedStore.get(
        `apiKeys.${keyName}`,
        {} as Array<number>
    );

    return encrypted.length > 0
        ? safeStorage.decryptString(Buffer.from(encrypted))
        : '';
};

export const persistSerialPortSettings = (
    serialNumber: string,
    serialPortSettings: Omit<SerialSettings, 'lastUpdated'>
) =>
    sharedStore.set(`${serialNumber}.${packageJson().name}`, {
        ...serialPortSettings,
        lastUpdated: Date.now(),
    });
export const getPersistedSerialPortSettings = (
    serialNumber: string
): SerialSettings | undefined => {
    const appName = packageJson().name;
    logger.info(
        `Getting serialport options from persistent store ${serialNumber}.${appName}`
    );
    return sharedStore.get(`${serialNumber}.${appName}`);
};
export const persistTerminalSettings = (
    device: Device,
    vComIndex: number,
    terminalSettings: TerminalSettings
) => {
    if (device.serialNumber) {
        sharedStore.set(
            `${device.serialNumber}.vCom-${vComIndex}.TerminalSettings`,
            terminalSettings
        );
    }
};
export const getPersistedTerminalSettings = (
    device: Device,
    vComIndex: number
): TerminalSettings | undefined => {
    if (device.serialNumber) {
        logger.info(
            `Get terminal settings from persistent store ${device.serialNumber}.vCom-${vComIndex}.TerminalSettings`
        );
        return sharedStore.get(
            `${device.serialNumber}.vCom-${vComIndex}.TerminalSettings`
        );
    }
    return undefined;
};

export const persistIsSendingUsageData = (value: boolean) =>
    sharedStore.set('isSendingTelemetry', value);
export const getIsSendingUsageData = () =>
    sharedStore.get('isSendingTelemetry', undefined) as boolean | undefined;
export const deleteIsSendingUsageData = () =>
    sharedStore.delete('isSendingTelemetry');

const existingUsageDataClientId = () => sharedStore.get('clientId');
const newUsageDataClientId = () => {
    const clientId = uuid();
    sharedStore.set('clientId', clientId);

    return clientId;
};
export const getUsageDataClientId = () =>
    existingUsageDataClientId() ?? newUsageDataClientId();

// This one must be initialised lazily, because the package.json is not read yet when this module is initialised.
// This can probably be changed when we bundle shared with the apps.
let appSpecificStore: Store | undefined;

interface SharedAppSpecificStoreSchema {
    currentPane?: number;
    isLogVisible?: boolean;
    isLoggingVerbose?: boolean;
}

export const getAppSpecificStore = <
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    StoreSchema extends Record<string, any>
>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options?: Store.Options<any>
) => {
    if (appSpecificStore == null) {
        appSpecificStore = new Store({
            name: packageJson().name,
            clearInvalidConfig: true,
            // @ts-expect-error `electron-store` assumes the app is the version of the launcher, override this to be the same as the app version
            projectVersion: packageJson().version,
            ...options,
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
export const persistLogVisible = (visible: boolean) =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().set(
        `isLogVisible`,
        visible
    );

export const persistIsLoggingVerbose = (value: boolean) =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().set(
        'isLoggingVerbose',
        value
    );
export const getIsLoggingVerbose = () =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().get(
        'isLoggingVerbose',
        false
    );

const resetIsLoggingVerbose = () =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().set(
        'isLoggingVerbose',
        false
    );
window.addEventListener('beforeunload', resetIsLoggingVerbose);
export const removeIsLoggingVerboseResetHandler = () =>
    window.removeEventListener('beforeunload', resetIsLoggingVerbose);

export const getPersistedLogVisible = () =>
    getAppSpecificStore<SharedAppSpecificStoreSchema>().get(`isLogVisible`);
