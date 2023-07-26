/// <reference types="react" />
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import { DeviceSetupConfig } from '../deviceSetup';
import { Device } from '../deviceSlice';
interface OutdatedDeviceTraits {
    serialPort?: boolean;
    serialport?: boolean;
}
export interface Props {
    deviceListing: DeviceTraits & OutdatedDeviceTraits;
    deviceSetupConfig?: DeviceSetupConfig;
    onDeviceSelected?: (device: Device, autoReselected: boolean) => void;
    onDeviceDeselected?: () => void;
    onDeviceConnected?: (device: Device) => void;
    onDeviceDisconnected?: (device: Device) => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
}
declare const _default: ({ deviceListing, deviceSetupConfig, onDeviceSelected, onDeviceDeselected, onDeviceConnected, onDeviceDisconnected, onDeviceIsReady, deviceFilter, }: Props) => JSX.Element;
export default _default;
//# sourceMappingURL=DeviceSelector.d.ts.map