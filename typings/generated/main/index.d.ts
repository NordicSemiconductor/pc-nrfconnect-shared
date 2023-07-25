export declare const ipc: {
    registerGetAppDetails: (onGetAppDetails: (webContents: Electron.WebContents) => import("../ipc/appDetails").AppDetailsFromLauncher) => void;
};
export declare const SERIALPORT_CHANNEL: {
    OPEN: string;
    CLOSE: string;
    WRITE: string;
    UPDATE: string;
    SET: string;
    ON_CLOSED: string;
    ON_DATA: string;
    ON_UPDATE: string;
    ON_SET: string;
    ON_CHANGED: string;
    ON_WRITE: string;
    IS_OPEN: string;
    GET_OPTIONS: string;
};
export type OverwriteOptions = {
    overwrite?: boolean;
    settingsLocked?: boolean;
};
export type OpenAppOptions = {
    device?: {
        serialNumber: string;
        serialPortPath?: string;
    };
};
//# sourceMappingURL=index.d.ts.map