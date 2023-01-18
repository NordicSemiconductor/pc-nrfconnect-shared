import { FC } from 'react';
import { Device as DeviceProps } from '../../../state';
import './device.scss';
interface Props {
    device: DeviceProps;
    doSelectDevice: (device: DeviceProps) => void;
    allowMoreInfoVisible: boolean;
}
declare const Device: FC<Props>;
export default Device;
//# sourceMappingURL=Device.d.ts.map