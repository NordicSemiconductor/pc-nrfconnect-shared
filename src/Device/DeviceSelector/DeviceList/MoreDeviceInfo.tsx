/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { SerialPort } from '@nordicsemiconductor/nrf-device-lib-js';
import { node } from 'prop-types';

import { Device } from '../../../state';
import { displayedDeviceName } from '../../deviceInfo/deviceInfo';

import './more-device-info.scss';

const Row: FC<{ children: ReactNode }> = ({ children }) => (
    <div className="info-row">
        <div className="flex-space" />
        {children}
    </div>
);
Row.propTypes = {
    children: node.isRequired,
};

const PcaNumber: FC<{ device: Device }> = ({ device }) => {
    if (device.boardVersion == null) {
        return null;
    }

    return <div>{device.boardVersion}</div>;
};

const MaybeDeviceName: FC<{ device: Device }> = ({ device }) => {
    const hasNickname = device.nickname !== '';
    if (!hasNickname) {
        return null;
    }

    return (
        <div className="name">
            {displayedDeviceName(device, { respectNickname: false })}
        </div>
    );
};

/* The type FixedSerialPort is currently needed, because the type SerialPort in
   device-lib-js is missing the path property. This is already corrected in
   https://github.com/NordicPlayground/nrf-device-lib-js/commit/d318962c but
   that change is not released as a version yet. As soon as that is released
   and we use the version here, then we can remove FixedSerialPort. */
interface FixedSerialPort {
    path?: string;
}

const Serialports: FC<{ ports: (SerialPort & FixedSerialPort)[] }> = ({
    ports,
}) => (
    <ul className="ports">
        {ports.map(port => (
            <li key={port.path}>{port.comName}</li>
        ))}
    </ul>
);

export const MoreDeviceInfo: FC<{ device: Device }> = ({ device }) => (
    <div className="more-infos">
        <Row>
            <PcaNumber device={device} />
        </Row>
        <Row>
            <MaybeDeviceName device={device} />
        </Row>
        <Row>
            <Serialports ports={device.serialPorts} />
        </Row>
    </div>
);

export default MoreDeviceInfo;
