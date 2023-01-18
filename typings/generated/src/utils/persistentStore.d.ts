import Store from 'electron-store';
export declare const persistNickname: (serialNumber: string, nickname: string) => void;
export declare const getPersistedNickname: (serialNumber: string) => string;
export declare const persistIsFavorite: (serialNumber: string, value: boolean) => void;
export declare const getPersistedIsFavorite: (serialNumber: string) => boolean;
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
//# sourceMappingURL=persistentStore.d.ts.map