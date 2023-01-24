import { FC } from 'react';
import { Device as DeviceProps } from '../../../state';
import './device-list.scss';
interface Props {
    doSelectDevice: (device: DeviceProps) => void;
    isVisible: boolean;
    deviceFilter?: (device: DeviceProps) => boolean;
}
declare const DeviceList: FC<Props>;
export default DeviceList;