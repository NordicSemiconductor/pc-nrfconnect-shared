import type { AppSpec } from './apps';
export interface OpenAppOptions {
    device?: {
        serialNumber: string;
        serialPortPath?: string;
    };
}
type OpenApp = (app: AppSpec, openAppOptions?: OpenAppOptions) => void;
type OpenLauncher = () => void;
export declare const forRenderer: {
    registerOpenApp: (handler: OpenApp) => Electron.IpcMain;
    registerOpenLauncher: (handler: OpenLauncher) => Electron.IpcMain;
};
export declare const inMain: {
    openApp: (app: AppSpec, openAppOptions?: OpenAppOptions | undefined) => void;
    openLauncher: () => void;
};
export {};
//# sourceMappingURL=openWindow.d.ts.map