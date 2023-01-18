/// <reference types="node" />
import type { AutoDetectTypes, SetOptions, UpdateOptions } from '@serialport/bindings-cpp';
import type { SerialPortOpenOptions } from 'serialport';
import { OverwriteOptions } from '../../main';
export declare const SerialPort: (options: SerialPortOpenOptions<AutoDetectTypes>, overwriteOptions?: OverwriteOptions, { onData, onClosed, onUpdate, onSet, onChange, onDataWritten, }?: {
    onData?: ((data: Uint8Array) => void) | undefined;
    onClosed?: (() => void) | undefined;
    onUpdate?: ((newOptions: UpdateOptions) => void) | undefined;
    onSet?: ((newOptions: SetOptions) => void) | undefined;
    onChange?: ((newOptions: SerialPortOpenOptions<AutoDetectTypes>) => void) | undefined;
    onDataWritten?: ((data: Uint8Array) => void) | undefined;
}) => Promise<{
    path: string;
    write: (data: string | number[] | Buffer) => void;
    close: () => Promise<void>;
    isOpen: () => Promise<boolean>;
    update: (newOptions: UpdateOptions) => void;
    set: (newOptions: SetOptions) => void;
}>;
//# sourceMappingURL=SerialPort.d.ts.map