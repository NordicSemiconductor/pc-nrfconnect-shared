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
export declare const persistNickname: (key: string, nickname: string) => void;
export declare const getPersistedNickname: (key: string) => string;
export declare const persistIsFavorite: (key: string, value: boolean) => void;
export declare const getPersistedIsFavorite: (key: string) => boolean;
export declare const persistSerialPortSettings: (key: string, serialPortSettings: Omit<SerialSettings, 'lastUpdated'>) => void;
export declare const getPersistedSerialPortSettings: (key: string) => SerialSettings | undefined;
export declare const persistTerminalSettings: (key: string, vComIndex: number, terminalSettings: TerminalSettings) => void;
export declare const getPersistedTerminalSettings: (key: string, vComIndex: number) => TerminalSettings | undefined;
export declare const persistIsSendingUsageData: (value: boolean) => void;
export declare const getIsSendingUsageData: () => boolean | undefined;
export declare const deleteIsSendingUsageData: () => void;
export declare const getUsageDataClientId: () => string;
export declare const persistIsLoggingVerbose: (value: boolean) => void;
export declare const getIsLoggingVerbose: () => boolean;
interface SharedAppSpecificStoreSchema {
    currentPane?: number;
}
export declare const getAppSpecificStore: <StoreSchema extends Record<string, any>>() => Store<StoreSchema & SharedAppSpecificStoreSchema>;
export declare const persistCurrentPane: (currentPane: number) => void;
export declare const getPersistedCurrentPane: () => number | undefined;
export {};
