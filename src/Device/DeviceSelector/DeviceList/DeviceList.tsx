/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bool, func } from 'prop-types';

import { Device as DeviceProps } from '../../../state';
import { Toggle } from '../../../Toggle/Toggle';
import classNames from '../../../utils/classNames';
import {
    getGlobalAutoReconnect,
    setGlobalAutoReconnect,
    sortedDevices,
} from '../../deviceSlice';
import { AnimatedItem, AnimatedList } from './AnimatedList';
import BrokenDevice from './BrokenDevice';
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

const NoSupportedDevicesConnected = () => (
    <div className="no-devices-connected">No supported devices connected</div>
);

const showAllDevices = () => true;

interface Props {
    doSelectDevice: (device: DeviceProps) => void;
    isVisible: boolean;
    deviceFilter?: (device: DeviceProps) => boolean;
}

const DeviceList: FC<Props> = ({
    isVisible,
    doSelectDevice,
    deviceFilter = showAllDevices,
}) => {
    const dispatch = useDispatch();
    const autoReconnect = useSelector(getGlobalAutoReconnect);
    const devices = useSelector(sortedDevices);
    const filteredDevices = devices.filter(deviceFilter);

    return (
        <div className={classNames('device-list', isVisible || 'hidden')}>
            <div className="global-auto-reconnect">
                <Toggle
                    id="toggle-global-auto-reconnect"
                    label="Auto Reconnect"
                    isToggled={autoReconnect}
                    onToggle={value => {
                        dispatch(setGlobalAutoReconnect(value));
                    }}
                />
            </div>
            {devices.length === 0 && <NoDevicesConnected />}
            {devices.length > 0 && filteredDevices.length === 0 ? (
                <NoSupportedDevicesConnected />
            ) : (
                <AnimatedList devices={devices}>
                    {filteredDevices.map(device => (
                        <AnimatedItem
                            key={device.serialNumber}
                            itemKey={device.serialNumber}
                        >
                            {device.traits.broken ? (
                                <BrokenDevice device={device} />
                            ) : (
                                <Device
                                    device={device}
                                    doSelectDevice={doSelectDevice}
                                    allowMoreInfoVisible={isVisible}
                                />
                            )}
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
    deviceFilter: func, // (device) => boolean
};

export default DeviceList;
