import type { AutoDetectTypes, SetOptions, UpdateOptions } from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';
import { OverwriteOptions } from '../../main';
export declare type SerialPort = Awaited<ReturnType<typeof createSerialPort>>;
export declare const createSerialPort: (options: SerialPortOpenOptions<AutoDetectTypes>, overwriteOptions?: OverwriteOptions) => Promise<{
    path: string;
    write: (data: string | number[] | Buffer) => void;
    close: () => Promise<void>;
    isOpen: () => Promise<boolean>;
    update: (newOptions: UpdateOptions) => void;
    set: (newOptions: SetOptions) => void;
    onData: (handler: (data: Uint8Array) => void) => () => void;
    onClosed: (handler: () => void) => () => void;
    onUpdate: (handler: (newOptions: UpdateOptions) => void) => () => void;
    onSet: (handler: (newOptions: SetOptions) => void) => () => void;
    onChange: (handler: (newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void) => () => void;
    onDataWritten: (handler: (data: Uint8Array) => void) => () => void;
}>;
