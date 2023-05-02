/// <reference types="react" />
import type { AutoDetectTypes } from '@serialport/bindings-cpp';
import { SerialPortOpenOptions } from 'serialport';
import { SerialPort } from './SerialPort';
interface ConflictingSettingsDialog {
    appName?: string;
    isVisible: boolean;
    onOverwrite: () => void;
    onCancel: () => void;
    localSettings: SerialPortOpenOptions<AutoDetectTypes>;
    setSerialPortCallback: (serialPort: SerialPort) => void;
}
declare const ConflictingSettingsDialog: ({ appName, isVisible, onOverwrite, onCancel, localSettings, setSerialPortCallback, }: ConflictingSettingsDialog) => JSX.Element;
export default ConflictingSettingsDialog;
