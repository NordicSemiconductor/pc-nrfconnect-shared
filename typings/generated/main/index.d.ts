/// <reference types="node" />
export declare const ipc: {
    broadcastChanged: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes>) => void;
    broadcastClosed: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[]) => void;
    broadcastDataReceived: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], data: unknown) => void;
    broadcastDataWritten: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], data: string | Buffer | number[]) => void;
    broadcastSet: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: import("@serialport/bindings-interface").SetOptions) => void;
    broadcastUpdated: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: import("@serialport/bindings-interface").UpdateOptions) => void;
    registerClose: (handler: ((sender: Electron.WebContents, path: string) => void) | ((sender: Electron.WebContents, path: string) => Promise<void>)) => void;
    registerGetAppDetails: (onGetAppDetails: (webContents: Electron.WebContents) => import("../ipc/appDetails").AppDetailsFromLauncher) => void;
    registerGetDownloadableApps: (handler: (() => import("../ipc/apps").GetDownloadableAppsResult) | (() => Promise<import("../ipc/apps").GetDownloadableAppsResult>)) => void;
    registerGetOptions: (handler: ((path: string) => import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes> | undefined) | ((path: string) => Promise<import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes> | undefined>)) => void;
    registerInstallDownloadableApp: (handler: ((app: import("../ipc/apps").DownloadableApp, version?: string | undefined) => import("../ipc/apps").DownloadableApp) | ((app: import("../ipc/apps").DownloadableApp, version?: string | undefined) => Promise<import("../ipc/apps").DownloadableApp>)) => void;
    registerIsOpen: (handler: ((path: string) => boolean) | ((path: string) => Promise<boolean>)) => void;
    registerOpen: (handler: ((sender: Electron.WebContents, options: import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes>, overwriteOptions: import("../ipc/serialPort").OverwriteOptions) => void) | ((sender: Electron.WebContents, options: import("serialport").SerialPortOpenOptions<import("@serialport/bindings-cpp").AutoDetectTypes>, overwriteOptions: import("../ipc/serialPort").OverwriteOptions) => Promise<void>)) => void;
    registerOpenApp: (handler: (app: import("../ipc/apps").AppSpec, openAppOptions?: import("../ipc/openWindow").OpenAppOptions | undefined) => void) => Electron.IpcMain;
    registerOpenLauncher: (handler: () => void) => Electron.IpcMain;
    registerSet: (handler: ((path: string, set: import("@serialport/bindings-interface").SetOptions) => void) | ((path: string, set: import("@serialport/bindings-interface").SetOptions) => Promise<void>)) => void;
    registerUpdate: (handler: ((path: string, options: import("@serialport/bindings-interface").UpdateOptions) => void) | ((path: string, options: import("@serialport/bindings-interface").UpdateOptions) => Promise<void>)) => void;
    registerWrite: (handler: ((path: string, data: string | Buffer | number[]) => void) | ((path: string, data: string | Buffer | number[]) => Promise<void>)) => void;
};
//# sourceMappingURL=index.d.ts.map