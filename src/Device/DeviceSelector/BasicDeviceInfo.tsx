/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InlineInput from '../../InlineInput/InlineInput';
import { Device } from '../../state';
import { displayedDeviceName } from '../deviceInfo/deviceInfo';
import {
    getAutoReconnectDevice,
    resetDeviceNickname,
    setDeviceNickname,
} from '../deviceSlice';
import DeviceIcon from './DeviceIcon';

import './basic-device-info.scss';

interface Props {
    device: Device;
    inputRef?: React.Ref<HTMLInputElement>;
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

const DeviceSerialNumber: FC<{ device: Device; reconnecting: boolean }> = ({
    device,
    reconnecting,
}) => (
    <div className="serial-number">
        {device.serialNumber} {reconnecting ? ' Reconnecting' : ''}
    </div>
);

interface BasicDeviceProps {
    device: Device;
    deviceNameInputRef?: React.Ref<HTMLInputElement>;
    toggles?: ReactNode;
}

const BasicDeviceInfo: FC<BasicDeviceProps> = ({
    device,
    deviceNameInputRef,
    toggles,
}) => {
    const autoReconnectDevice = useSelector(getAutoReconnectDevice);
    const deviceWaitingToReconnect =
        device.serialNumber === autoReconnectDevice?.device.serialNumber &&
        autoReconnectDevice?.disconnectionTime !== undefined;

    return (
        <div className="basic-device-info">
            <DeviceIcon device={device} />
            <div className="details">
                <DeviceName device={device} inputRef={deviceNameInputRef} />
                <DeviceSerialNumber
                    device={device}
                    reconnecting={deviceWaitingToReconnect}
                />
            </div>
            <div className="toggles">{toggles}</div>
        </div>
    );
};

export default BasicDeviceInfo;
