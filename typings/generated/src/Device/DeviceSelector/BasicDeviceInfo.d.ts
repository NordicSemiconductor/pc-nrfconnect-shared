import React, { FC, ReactNode } from 'react';
import { Device } from '../../state';
import './basic-device-info.scss';
interface BasicDeviceProps {
    device: Device;
    deviceNameInputRef?: React.Ref<HTMLInputElement>;
    toggles?: ReactNode;
}
declare const BasicDeviceInfo: FC<BasicDeviceProps>;
export default BasicDeviceInfo;
//# sourceMappingURL=BasicDeviceInfo.d.ts.map