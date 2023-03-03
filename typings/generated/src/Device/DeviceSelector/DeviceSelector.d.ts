/// <reference types="react" />
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';
import { Device } from '../../state';
import { DeviceSetup as DeviceSetupShared } from '../deviceSetup';
interface OutdatedDeviceTraits {
    serialPort?: boolean;
    serialport?: boolean;
}
export interface Props {
    deviceListing: DeviceTraits & OutdatedDeviceTraits;
    deviceSetup?: DeviceSetupShared;
    releaseCurrentDevice?: () => void;
    onDeviceSelected?: (device: Device, autoReselected: boolean) => void;
    onDeviceDeselected?: () => void;
    onDeviceConnected?: (device: Device) => void;
    onDeviceDisconnected?: (device: Device) => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
}
declare const _default: ({ deviceListing, deviceSetup, releaseCurrentDevice, onDeviceSelected, onDeviceDeselected, onDeviceConnected, onDeviceDisconnected, onDeviceIsReady, deviceFilter, }: Props) => JSX.Element;
export default _default;
