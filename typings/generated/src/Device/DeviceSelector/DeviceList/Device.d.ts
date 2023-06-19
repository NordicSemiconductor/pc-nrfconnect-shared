/// <reference types="react" />
import { Device as DeviceProps } from '../../deviceSlice';
import './device.scss';
interface Props {
    device: DeviceProps;
    doSelectDevice: (device: DeviceProps, autoReselected: boolean) => void;
    allowMoreInfoVisible: boolean;
}
declare const _default: ({ device, doSelectDevice, allowMoreInfoVisible }: Props) => JSX.Element;
export default _default;
