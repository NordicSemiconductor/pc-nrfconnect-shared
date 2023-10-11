/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import { SerialPort } from '../../../../nrfutil/device/common';
import { displayedDeviceName } from '../../deviceInfo/deviceInfo';
import { Device } from '../../deviceSlice';

import './more-device-info.scss';

const Row = ({ children }: { children: ReactNode }) => (
    <div className="info-row">
        <div className="flex-space" />
        {children}
    </div>
);

const PcaNumber = ({ device }: { device: Device }) => {
    if (!device.devkit?.boardVersion) {
        return null;
    }

    return <div>{device.devkit.boardVersion}</div>;
};

const MaybeDeviceName = ({ device }: { device: Device }) => {
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

const Serialports = ({ ports }: { ports: SerialPort[] }) => (
    <ul className="ports">
        {ports.map(port => (
            <li key={port.path}>{port.comName}</li>
        ))}
    </ul>
);

export default ({ device }: { device: Device }) => (
    <div className="more-infos">
        <Row>
            <PcaNumber device={device} />
        </Row>
        <Row>
            <MaybeDeviceName device={device} />
        </Row>
        {device.serialPorts && (
            <Row>
                <Serialports ports={device.serialPorts} />
            </Row>
        )}
    </div>
);
