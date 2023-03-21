import { FC } from 'react';
import { Device as DeviceProps } from '../../../state';
import './device.scss';
interface Props {
    device: DeviceProps;
    doSelectDevice: (device: DeviceProps, autoReselected: boolean) => void;
    allowMoreInfoVisible: boolean;
}
declare const Device: FC<Props>;
export default Device;
