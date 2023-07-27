export declare const ipc: {
    registerGetAppDetails: (onGetAppDetails: (webContents: Electron.WebContents) => import("../ipc/appDetails").AppDetailsFromLauncher) => void;
    registerOpenApp: (handler: (app: import("../ipc/openWindow").AppSpec, openAppOptions?: import("../ipc/openWindow").OpenAppOptions | undefined) => void) => Electron.IpcMain;
    registerOpenLauncher: (handler: () => void) => Electron.IpcMain;
};
export type { OpenAppOptions } from '../ipc/openWindow';
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
//# sourceMappingURL=index.d.ts.map