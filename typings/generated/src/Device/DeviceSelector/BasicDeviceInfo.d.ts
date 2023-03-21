import React, { ReactNode } from 'react';
import { Device } from '../../state';
import './basic-device-info.scss';
interface BasicDeviceProps {
    device: Device;
    deviceNameInputRef?: React.Ref<HTMLInputElement>;
    toggles?: ReactNode;
    showWaitingStatus?: boolean;
}
declare const _default: ({ device, deviceNameInputRef, toggles, showWaitingStatus, }: BasicDeviceProps) => JSX.Element;
export default _default;
