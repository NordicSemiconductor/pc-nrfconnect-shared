/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { arrayOf, node, shape, string } from 'prop-types';

import { displayedDeviceName, serialports } from '../../deviceInfo/deviceInfo';
import deviceShape from '../deviceShape';

import './more-device-info.scss';

const Row = ({ children }) => (
    <div className="info-row">
        <div className="flex-space" />
        {children}
    </div>
);
Row.propTypes = {
    children: node.isRequired,
};

const PcaNumber = ({ device }) => {
    if (device.boardVersion == null) {
        return null;
    }

    return <div>{device.boardVersion}</div>;
};
PcaNumber.propTypes = {
    device: deviceShape.isRequired,
};

const MaybeDeviceName = ({ device }) => {
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
MaybeDeviceName.propTypes = {
    device: deviceShape.isRequired,
};

const Serialports = ({ ports }) => (
    <ul className="ports">
        {ports.map(port => (
            <li key={port.path}>{port.comName}</li>
        ))}
    </ul>
);
Serialports.propTypes = {
    ports: arrayOf(
        shape({
            path: string.isRequired,
        }).isRequired
    ).isRequired,
};

const MoreDeviceInfo = ({ device }) => (
    <div className="more-infos">
        <Row>
            <PcaNumber device={device} />
        </Row>
        <Row>
            <MaybeDeviceName device={device} />
        </Row>
        <Row>
            <Serialports ports={serialports(device)} />
        </Row>
    </div>
);

MoreDeviceInfo.propTypes = {
    device: deviceShape.isRequired,
};

export default MoreDeviceInfo;
