/// <reference types="node" />
export { registerLauncherWindowFromMain } from '../ipc/infrastructure/mainToRenderer';
export declare const appDetails: {
    forRenderer: {
        registerGetAppDetails: (onGetAppDetails: (webContents: Electron.WebContents) => import("../ipc/appDetails").AppDetailsFromLauncher) => void;
    };
};
export declare const apps: {
    forRenderer: {
        registerGetDownloadableApps: (handler: (() => {
            apps: import("../ipc/apps").DownloadableApp[];
            appsWithErrors: import("../ipc/apps").AppWithError[];
            sourcesWithErrors: import("../ipc/apps").SourceWithError[];
        }) | (() => Promise<{
            apps: import("../ipc/apps").DownloadableApp[];
            appsWithErrors: import("../ipc/apps").AppWithError[];
            sourcesWithErrors: import("../ipc/apps").SourceWithError[];
        }>)) => void;
        registerInstallDownloadableApp: (handler: ((app: import("../ipc/apps").DownloadableApp, version?: string | undefined) => import("../ipc/apps").DownloadableApp) | ((app: import("../ipc/apps").DownloadableApp, version?: string | undefined) => Promise<import("../ipc/apps").DownloadableApp>)) => void;
    };
};
export declare const openWindow: {
    forRenderer: {
        registerOpenApp: (handler: (app: import("../ipc/apps").AppSpec, openAppOptions?: import("../ipc/openWindow").OpenAppOptions | undefined) => void) => Electron.IpcMain;
        registerOpenLauncher: (handler: () => void) => Electron.IpcMain;
    };
};
export declare const preventSleep: {
    forRenderer: {
        registerStart: (handler: (() => number) | (() => Promise<number>)) => void;
        registerEnd: (handler: (id: number) => void) => Electron.IpcMain;
    };
};
export declare const serialPort: {
    inRenderer: {
        broadcastChanged: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes>) => void;
        broadcastClosed: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[]) => void;
        broadcastDataReceived: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], data: unknown) => void;
        broadcastDataWritten: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], data: string | Buffer | number[]) => void;
        broadcastSet: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: import("@serialport/bindings-interface").SetOptions) => void;
        broadcastUpdated: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: import("@serialport/bindings-interface").UpdateOptions) => void;
    };
    forRenderer: {
        registerClose: (handler: ((sender: Electron.WebContents, path: string) => void) | ((sender: Electron.WebContents, path: string) => Promise<void>)) => void;
        registerGetOptions: (handler: ((path: string) => import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes> | undefined) | ((path: string) => Promise<import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes> | undefined>)) => void;
        registerIsOpen: (handler: ((path: string) => boolean) | ((path: string) => Promise<boolean>)) => void;
        registerOpen: (handler: ((sender: Electron.WebContents, options: import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes>, overwriteOptions: import("../ipc/serialPort").OverwriteOptions) => void) | ((sender: Electron.WebContents, options: import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes>, overwriteOptions: import("../ipc/serialPort").OverwriteOptions) => Promise<void>)) => void;
        registerSet: (handler: ((path: string, set: import("@serialport/bindings-interface").SetOptions) => void) | ((path: string, set: import("@serialport/bindings-interface").SetOptions) => Promise<void>)) => void;
        registerUpdate: (handler: ((path: string, options: import("@serialport/bindings-interface").UpdateOptions) => void) | ((path: string, options: import("@serialport/bindings-interface").UpdateOptions) => Promise<void>)) => void;
        registerWrite: (handler: ((path: string, data: string | Buffer | number[]) => void) | ((path: string, data: string | Buffer | number[]) => Promise<void>)) => void;
    };
};
export * from '../ipc/MetaFiles';
export { type OverwriteOptions } from '../ipc/serialPort';
export { type OpenAppOptions } from '../ipc/openWindow';
//# sourceMappingURL=index.d.ts.map