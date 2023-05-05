import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import Store from 'electron-store';
import { SerialPortOpenOptions } from 'serialport';
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
export declare const persistNickname: (serialNumber: string, nickname: string) => void;
export declare const getPersistedNickname: (serialNumber: string) => string;
export declare const persistIsFavorite: (serialNumber: string, value: boolean) => void;
export declare const getPersistedIsFavorite: (serialNumber: string) => boolean;
export declare const persistSerialPortSettings: (serialNumber: string, serialPortSettings: Omit<SerialSettings, 'lastUpdated'>) => void;
export declare const getPersistedSerialPortSettings: (serialNumber: string) => SerialSettings | undefined;
export declare const persistTerminalSettings: (serialNumber: string, vComIndex: number, terminalSettings: TerminalSettings) => void;
export declare const getPersistedTerminalSettings: (serialNumber: string, vComIndex: number) => TerminalSettings | undefined;
export declare const persistIsSendingUsageData: (value: boolean) => void;
export declare const getIsSendingUsageData: () => boolean | undefined;
export declare const deleteIsSendingUsageData: () => void;
export declare const getUsageDataClientId: () => string;
export declare const persistIsLoggingVerbose: (value: boolean) => void;
export declare const getIsLoggingVerbose: () => boolean;
interface SharedAppSpecificStoreSchema {
    currentPane?: number;
}
export declare const getAppSpecificStore: <StoreSchema extends Record<string, any>>(options?: Store.Options<any>) => Store<StoreSchema & SharedAppSpecificStoreSchema>;
export declare const persistCurrentPane: (currentPane: number) => void;
export declare const getPersistedCurrentPane: () => number | undefined;
export {};
