/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InlineInput from '../../InlineInput/InlineInput';
import { Device } from '../../state';
import {
    getAutoReselectDevice,
    getWaitingForDevice,
    getWaitingToAutoReselect,
} from '../deviceAutoSelectSlice';
import { displayedDeviceName } from '../deviceInfo/deviceInfo';
import { resetDeviceNickname, setDeviceNickname } from '../deviceSlice';
import DeviceIcon from './DeviceIcon';

import './basic-device-info.scss';

interface Props {
    device: Device;
    inputRef?: React.Ref<HTMLInputElement>;
    messageType: 'AutoReselect' | 'WaitingForDevice' | 'DeviceName';
}

const DeviceName = ({ device, inputRef, messageType }: Props) => {
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

    switch (messageType) {
        case 'AutoReselect':
            return <div className="reconnecting">Reconnecting...</div>;
            break;
        case 'WaitingForDevice':
            return <div className="reconnecting">Rebooting...</div>;
            break;
        case 'DeviceName':
            return (
                <InlineInput
                    ref={inputRef}
                    className="name"
                    value={displayedDeviceName(device)}
                    isValid={name => name !== ''}
                    onChange={setOrResetNickname}
                />
            );
    }
};

const DeviceSerialNumber = ({ device }: { device: Device }) => (
    <div className="serial-number">{device.serialNumber}</div>
);

interface BasicDeviceProps {
    device: Device;
    deviceNameInputRef?: React.Ref<HTMLInputElement>;
    toggles?: ReactNode;
    showWaitingStatus?: boolean;
}

export default ({
    device,
    deviceNameInputRef,
    toggles,
    showWaitingStatus = false,
}: BasicDeviceProps) => {
    const [messageType, setMessageType] = useState<
        'AutoReselect' | 'WaitingForDevice' | 'DeviceName'
    >('DeviceName');
    const autoReselectDevice = useSelector(getAutoReselectDevice);
    const waitingToAutoReselect = useSelector(getWaitingToAutoReselect);
    const waitingForDevice = useSelector(getWaitingForDevice);
    const deviceWaiting =
        (waitingToAutoReselect || waitingForDevice) &&
        device.serialNumber === autoReselectDevice?.serialNumber;

    useEffect(() => {
        if (!showWaitingStatus) {
            setMessageType('DeviceName');
        } else if (waitingForDevice && deviceWaiting) {
            setMessageType('WaitingForDevice');
        } else if (waitingToAutoReselect && deviceWaiting) {
            setMessageType('AutoReselect');
        } else {
            setMessageType('DeviceName');
        }
    }, [
        deviceWaiting,
        showWaitingStatus,
        waitingForDevice,
        waitingToAutoReselect,
    ]);

    return (
        <div className="basic-device-info">
            <DeviceIcon device={device} />
            <div className="details">
                <DeviceName
                    device={device}
                    inputRef={deviceNameInputRef}
                    messageType={messageType}
                />
                <DeviceSerialNumber device={device} />
            </div>
            <div className="toggles">{toggles}</div>
        </div>
    );
};
