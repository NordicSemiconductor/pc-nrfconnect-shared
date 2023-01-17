import { FC } from 'react';
import './select-device.scss';
interface Props {
    deviceListVisible: boolean;
    toggleDeviceListVisible: () => void;
}
declare const SelectDevice: FC<Props>;
export default SelectDevice;
