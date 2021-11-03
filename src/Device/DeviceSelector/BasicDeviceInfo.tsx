/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { useDispatch } from 'react-redux';

import InlineInput from '../../InlineInput/InlineInput';
import { Device } from '../../state';
import { displayedDeviceName } from '../deviceInfo/deviceInfo';
import { resetDeviceNickname, setDeviceNickname } from '../deviceSlice';
import DeviceIcon from './DeviceIcon';

import './basic-device-info.scss';

interface Props {
    device: Device;
    inputRef?: any;
}

const DeviceName: FC<Props> = ({ device, inputRef }) => {
    const dispatch = useDispatch();
    const setOrResetNickname = (name: string) => {
        const newNameIsEqualToDefaultName =
            name === displayedDeviceName(device, { respectNickname: false });

        if (newNameIsEqualToDefaultName) {
            dispatch(resetDeviceNickname(device.serialNumber));
        } else {
            dispatch(setDeviceNickname(device.serialNumber, name));
        }
    };

    return (
        <InlineInput
            ref={inputRef}
            className="name"
            value={displayedDeviceName(device)}
            isValid={name => name !== ''}
            onChange={setOrResetNickname}
        />
    );
};

const DeviceSerialNumber: FC<{ device: Device }> = ({ device }) => (
    <div className="serial-number">{device.serialNumber}</div>
);

interface BasicDeviceProps {
    device?: Device;
    deviceNameInputRef?: any; // shape({ current: shape({ focus: func.isRequired }) }),
    toggles: ReactNode;
}

const BasicDeviceInfo: FC<BasicDeviceProps> = ({
    device,
    deviceNameInputRef,
    toggles,
}) => (
    <div className="basic-device-info">
        <DeviceIcon device={device} />
        <div className="details">
            <DeviceName device={device} inputRef={deviceNameInputRef} />
            <DeviceSerialNumber device={device} />
        </div>
        <div className="toggles">{toggles}</div>
    </div>
);

export default BasicDeviceInfo;
