export interface AppSpec {
    name: string;
    source: string;
}
export interface OpenAppOptions {
    device?: {
        serialNumber: string;
        serialPortPath?: string;
    };
}
type OpenApp = (app: AppSpec, openAppOptions?: OpenAppOptions) => void;
export declare const openApp: (app: AppSpec, openAppOptions?: OpenAppOptions | undefined) => void;
export declare const registerOpenApp: (handler: OpenApp) => Electron.IpcMain;
type OpenLauncher = () => void;
export declare const openLauncher: () => void;
export declare const registerOpenLauncher: (handler: OpenLauncher) => Electron.IpcMain;
export {};
//# sourceMappingURL=openWindow.d.ts.map