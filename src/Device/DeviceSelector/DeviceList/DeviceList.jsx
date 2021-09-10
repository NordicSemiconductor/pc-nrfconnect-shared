/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { bool, func } from 'prop-types';

import classNames from '../../../utils/classNames';
import { sortedDevices } from '../../deviceReducer';
import { AnimatedItem, AnimatedList } from './AnimatedList';
import Device from './Device';

import './device-list.scss';

const NoDevicesConnected = () => (
    <div className="no-devices-connected">
        Connect a{' '}
        <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.nordicsemi.com/Software-and-tools/Development-Kits"
        >
            Nordic development kit
        </a>{' '}
        to your computer.
    </div>
);

const DeviceList = ({ isVisible, doSelectDevice }) => {
    const devices = useSelector(sortedDevices);

    return (
        <div className={classNames('device-list', isVisible || 'hidden')}>
            {devices.length === 0 ? (
                <NoDevicesConnected />
            ) : (
                <AnimatedList devices={devices}>
                    {devices.map(device => (
                        <AnimatedItem
                            key={device.serialNumber}
                            itemKey={device.serialNumber}
                        >
                            <Device
                                device={device}
                                doSelectDevice={doSelectDevice}
                                allowMoreInfoVisible={isVisible}
                            />
                        </AnimatedItem>
                    ))}
                </AnimatedList>
            )}
        </div>
    );
};
DeviceList.propTypes = {
    doSelectDevice: func.isRequired,
    isVisible: bool.isRequired,
};

export default DeviceList;
