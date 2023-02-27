/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import InlineInput from '../../InlineInput/InlineInput';
import { Device } from '../../state';
import {
    getAutoReselectDevice,
    getWaitingToAutoReselect,
} from '../deviceAutoSelectSlice';
import { displayedDeviceName } from '../deviceInfo/deviceInfo';
import { resetDeviceNickname, setDeviceNickname } from '../deviceSlice';
import DeviceIcon from './DeviceIcon';

import './basic-device-info.scss';

interface Props {
    device: Device;
    inputRef?: React.Ref<HTMLInputElement>;
    reconnecting: boolean;
}

const DeviceName = ({ device, inputRef, reconnecting }: Props) => {
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

    return reconnecting ? (
        <div className="reconnecting">Reconnecting...</div>
    ) : (
        <InlineInput
            ref={inputRef}
            className="name"
            value={displayedDeviceName(device)}
            isValid={name => name !== ''}
            onChange={setOrResetNickname}
        />
    );
};

const DeviceSerialNumber = ({ device }: { device: Device }) => (
    <div className="serial-number">{device.serialNumber}</div>
);

interface BasicDeviceProps {
    device: Device;
    deviceNameInputRef?: React.Ref<HTMLInputElement>;
    toggles?: ReactNode;
    showReconnecting?: boolean;
}

export default ({
    device,
    deviceNameInputRef,
    toggles,
    showReconnecting = false,
}: BasicDeviceProps) => {
    const autoReselectDevice = useSelector(getAutoReselectDevice);
    const waitingToAutoReselect = useSelector(getWaitingToAutoReselect);
    const deviceWaitingToReselect =
        waitingToAutoReselect &&
        device.serialNumber === autoReselectDevice?.serialNumber;

    return (
        <div className="basic-device-info">
            <DeviceIcon device={device} />
            <div className="details">
                <DeviceName
                    device={device}
                    inputRef={deviceNameInputRef}
                    reconnecting={deviceWaitingToReselect && showReconnecting}
                />
                <DeviceSerialNumber device={device} />
            </div>
            <div className="toggles">{toggles}</div>
        </div>
    );
};
