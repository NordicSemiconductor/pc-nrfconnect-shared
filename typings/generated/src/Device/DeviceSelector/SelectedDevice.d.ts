import { FC } from 'react';
import './selected-device.scss';
declare const SelectedDevice: FC<{
    doDeselectDevice: () => void;
    toggleDeviceListVisible: () => void;
}>;
export default SelectedDevice;
