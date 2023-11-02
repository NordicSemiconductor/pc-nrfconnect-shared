/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import { SerialPort } from '../../../../nrfutil/device/common';
import { displayedDeviceName } from '../../deviceInfo/deviceInfo';
import { Device } from '../../deviceSlice';

const Row = ({ children }: { children: ReactNode }) => (
    <div className=" tw-flex tw-flex-row tw-pr-5">
        <div className=" tw-w-[68px]" />
        {children}
    </div>
);

const PcaNumber = ({ device }: { device: Device }) => {
    if (!device.devkit?.boardVersion) {
        return null;
    }

    return (
        <Row>
            <div>{device.devkit.boardVersion}</div>
        </Row>
    );
};

const MaybeDeviceName = ({ device }: { device: Device }) => {
    if (!device.nickname) {
        return null;
    }

    return (
        <Row>
            <div>{displayedDeviceName(device, { respectNickname: false })}</div>
        </Row>
    );
};

const Serialports = ({ ports }: { ports: SerialPort[] }) =>
    ports.length > 0 ? (
        <Row>
            <ul className="tw-underline">
                {ports.map(port => (
                    <li key={port.path}>{port.comName}</li>
                ))}
            </ul>
        </Row>
    ) : null;

export default ({ device }: { device: Device }) => (
    <div className="tw-preflight tw-flex tw-flex-col tw-gap-2">
        <PcaNumber device={device} />
        <MaybeDeviceName device={device} />
        <Serialports ports={device.serialPorts ?? []} />
    </div>
);
