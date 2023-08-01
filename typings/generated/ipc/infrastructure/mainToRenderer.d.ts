import { BrowserWindow, WebContents } from 'electron';
export declare const registerLauncherWindowFromMain: (window: BrowserWindow) => void;
export declare const send: <T extends (...args: never[]) => void>(channel: string) => (...args: Parameters<T>) => void | undefined;
export declare const on: <T extends (...args: never[]) => void>(channel: string) => (handler: T) => Electron.IpcRenderer;
export declare const broadcast: <T extends (...args: never[]) => void>(channel: string) => (subChannel: string, targets?: Pick<WebContents, 'send'>[], ...args: Parameters<T>) => void;
export declare const onBroadcasted: <T extends (...args: never[]) => void>(channel: string, subChannel: string) => (handler: T) => Electron.IpcRenderer;
//# sourceMappingURL=mainToRenderer.d.ts.map