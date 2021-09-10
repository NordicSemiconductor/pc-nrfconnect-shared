/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';
import { func, node, shape } from 'prop-types';

import InlineInput from '../../InlineInput/InlineInput';
import { resetDeviceNickname, setDeviceNickname } from '../deviceActions';
import { displayedDeviceName } from '../deviceInfo/deviceInfo';
import DeviceIcon from './DeviceIcon';
import deviceShape from './deviceShape';

import './basic-device-info.scss';

const DeviceName = ({ device, inputRef }) => {
    const dispatch = useDispatch();
    const setOrResetNickname = name => {
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
DeviceName.propTypes = {
    device: deviceShape.isRequired,
    inputRef: shape({ current: shape({ focus: func.isRequired }) }),
};

const DeviceSerialNumber = ({ device }) => (
    <div className="serial-number">{device.serialNumber}</div>
);
DeviceSerialNumber.propTypes = {
    device: deviceShape.isRequired,
};

const BasicDeviceInfo = ({ device, deviceNameInputRef, toggles }) => (
    <div className="basic-device-info">
        <DeviceIcon device={device} />
        <div className="details">
            <DeviceName device={device} inputRef={deviceNameInputRef} />
            <DeviceSerialNumber device={device} />
        </div>
        <div className="toggles">{toggles}</div>
    </div>
);
BasicDeviceInfo.propTypes = {
    device: deviceShape.isRequired,
    deviceNameInputRef: shape({ current: shape({ focus: func.isRequired }) }),
    toggles: node,
};

export default BasicDeviceInfo;
