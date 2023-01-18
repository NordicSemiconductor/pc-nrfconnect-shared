import { FC } from 'react';
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
    onDeviceSelected?: (device: Device) => void;
    onDeviceDeselected?: () => void;
    onDeviceConnected?: (device: Device) => void;
    onDeviceDisconnected?: (device: Device) => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
}
declare const DeviceSelector: FC<Props>;
export default DeviceSelector;
//# sourceMappingURL=DeviceSelector.d.ts.map