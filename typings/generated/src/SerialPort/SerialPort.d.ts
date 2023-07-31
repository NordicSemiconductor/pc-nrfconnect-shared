/// <reference types="node" />
import type { AutoDetectTypes, SetOptions, UpdateOptions } from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';
import { OverwriteOptions } from '../../ipc/serialPort';
export type SerialPort = Awaited<ReturnType<typeof createSerialPort>>;
export declare const createSerialPort: (options: SerialPortOpenOptions<AutoDetectTypes>, overwriteOptions?: OverwriteOptions) => Promise<{
    path: string;
    close: () => Promise<void>;
    write: (data: string | number[] | Buffer) => Promise<void>;
    update: (newOptions: UpdateOptions) => Promise<void>;
    set: (newOptions: SetOptions) => Promise<void>;
    isOpen: () => Promise<boolean>;
    getOptions: () => Promise<SerialPortOpenOptions<AutoDetectTypes> | undefined>;
    onData: (handler: (data: Uint8Array) => void) => () => void;
    onClosed: (handler: () => void) => () => void;
    onUpdate: (handler: (newOptions: UpdateOptions) => void) => () => void;
    onSet: (handler: (newOptions: SetOptions) => void) => () => void;
    onChange: (handler: (newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void) => () => void;
    onDataWritten: (handler: (data: Uint8Array) => void) => () => void;
}>;
export declare const getSerialPortOptions: (path: string) => Promise<(Omit<import("@serialport/stream").StreamOptions<AutoDetectTypes>, "binding"> & import("@serialport/bindings-cpp").DarwinOpenOptions) | (Omit<import("@serialport/stream").StreamOptions<AutoDetectTypes>, "binding"> & import("@serialport/bindings-cpp").WindowsOpenOptions) | undefined>;
//# sourceMappingURL=SerialPort.d.ts.map