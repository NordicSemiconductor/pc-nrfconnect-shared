/// <reference types="node" />
import type { AutoDetectTypes, SetOptions, UpdateOptions } from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';
export type OverwriteOptions = {
    overwrite?: boolean;
    settingsLocked?: boolean;
};
type OnDataReceived = (data: unknown) => void;
type OnDataWritten = (data: string | number[] | Buffer) => void;
type OnClosed = () => void;
type OnUpdate = (newOptions: UpdateOptions) => void;
type OnSet = (newOptions: SetOptions) => void;
type OnChanged = (newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void;
export declare const inRenderer: {
    broadcastChanged: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void;
    broadcastClosed: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[]) => void;
    broadcastDataReceived: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], data: unknown) => void;
    broadcastDataWritten: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], data: string | Buffer | number[]) => void;
    broadcastSet: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: SetOptions) => void;
    broadcastUpdated: (subChannel: string, targets?: Pick<Electron.WebContents, "send">[], newOptions: UpdateOptions) => void;
};
export declare const forRenderer: {
    registerClose: (handler: ((sender: Electron.WebContents, path: string) => void) | ((sender: Electron.WebContents, path: string) => Promise<void>)) => void;
    registerGetOptions: (handler: ((path: string) => SerialPortOpenOptions<AutoDetectTypes> | undefined) | ((path: string) => Promise<SerialPortOpenOptions<AutoDetectTypes> | undefined>)) => void;
    registerIsOpen: (handler: ((path: string) => boolean) | ((path: string) => Promise<boolean>)) => void;
    registerOpen: (handler: ((sender: Electron.WebContents, options: SerialPortOpenOptions<AutoDetectTypes>, overwriteOptions: OverwriteOptions) => void) | ((sender: Electron.WebContents, options: SerialPortOpenOptions<AutoDetectTypes>, overwriteOptions: OverwriteOptions) => Promise<void>)) => void;
    registerSet: (handler: ((path: string, set: SetOptions) => void) | ((path: string, set: SetOptions) => Promise<void>)) => void;
    registerUpdate: (handler: ((path: string, options: UpdateOptions) => void) | ((path: string, options: UpdateOptions) => Promise<void>)) => void;
    registerWrite: (handler: ((path: string, data: string | Buffer | number[]) => void) | ((path: string, data: string | Buffer | number[]) => Promise<void>)) => void;
};
export declare const inMain: {
    open: (options: SerialPortOpenOptions<AutoDetectTypes>, overwriteOptions: OverwriteOptions) => Promise<void>;
    close: (path: string) => Promise<void>;
    write: (path: string, data: string | Buffer | number[]) => Promise<void>;
    update: (path: string, options: UpdateOptions) => Promise<void>;
    set: (path: string, set: SetOptions) => Promise<void>;
    isOpen: (path: string) => Promise<boolean>;
    getOptions: (path: string) => Promise<SerialPortOpenOptions<AutoDetectTypes> | undefined>;
};
export declare const forMain: {
    registerOnDataReceived: (path: string) => (handler: OnDataReceived) => Electron.IpcRenderer;
    registerOnDataWritten: (path: string) => (handler: OnDataWritten) => Electron.IpcRenderer;
    registerOnClosed: (path: string) => (handler: OnClosed) => Electron.IpcRenderer;
    registerOnUpdated: (path: string) => (handler: OnUpdate) => Electron.IpcRenderer;
    registerOnSet: (path: string) => (handler: OnSet) => Electron.IpcRenderer;
    registerOnChanged: (path: string) => (handler: OnChanged) => Electron.IpcRenderer;
};
export {};
//# sourceMappingURL=serialPort.d.ts.map