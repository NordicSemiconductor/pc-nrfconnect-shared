import { WebContents } from 'electron';
export declare const send: <T extends (...args: never[]) => void>(channel: string) => (...args: Parameters<T>) => void;
export declare const on: <T extends (...args: never[]) => void>(channel: string) => (handler: T) => Electron.IpcMain;
export declare const invoke: <T extends (...args: never[]) => unknown>(channel: string) => (...args: Parameters<T>) => Promise<ReturnType<T>>;
export declare const handle: <T extends (...args: never[]) => unknown>(channel: string) => (handler: ((...args: Parameters<T>) => ReturnType<T>) | ((...args: Parameters<T>) => Promise<ReturnType<T>>)) => void;
export declare const handleWithSender: <T extends (...args: never[]) => unknown>(channel: string) => (handler: ((sender: WebContents, ...args: Parameters<T>) => ReturnType<T>) | ((sender: WebContents, ...args: Parameters<T>) => Promise<ReturnType<T>>)) => void;
//# sourceMappingURL=rendererToMain.d.ts.map