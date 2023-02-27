/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Device as DeviceProps } from '../../../state';
import { Toggle } from '../../../Toggle/Toggle';
import classNames from '../../../utils/classNames';
import {
    getGlobalAutoReselect,
    setGlobalAutoReselect,
} from '../../deviceAutoSelectSlice';
import { displayedDeviceName } from '../../deviceInfo/deviceInfo';
import { getDevices } from '../../deviceSlice';
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

const sorted = (devices: DeviceProps[]) =>
    [...devices].sort((a, b) => {
        if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
        }

        return displayedDeviceName(a) < displayedDeviceName(b) ? -1 : 1;
    });
interface Props {
    doSelectDevice: (
        device: DeviceProps,
        autoReconnected: boolean,
        forcedAutoReconnected: boolean
    ) => void;
    isVisible: boolean;
    deviceFilter?: (device: DeviceProps) => boolean;
}

const DeviceList: FC<Props> = ({
    isVisible,
    doSelectDevice,
    deviceFilter = showAllDevices,
}) => {
    const dispatch = useDispatch();
    const autoReconnect = useSelector(getGlobalAutoReselect);
    const devices = useSelector(getDevices);

    const sortedDevices = useMemo(
        () => sorted([...devices.values()]),
        [devices]
    );

    const filteredDevices = useMemo(
        () => sortedDevices.filter(deviceFilter),
        [deviceFilter, sortedDevices]
    );

    return (
        <div className={classNames('device-list', isVisible || 'hidden')}>
            <div className="global-auto-reconnect">
                <Toggle
                    id="toggle-global-auto-reconnect"
                    label="Auto Reconnect"
                    isToggled={autoReconnect}
                    onToggle={value => {
                        dispatch(setGlobalAutoReselect(value));
                    }}
                />
            </div>
            {sortedDevices.length === 0 && <NoDevicesConnected />}
            {sortedDevices.length > 0 && filteredDevices.length === 0 ? (
                <NoSupportedDevicesConnected />
            ) : (
                <AnimatedList devices={sortedDevices}>
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

export default DeviceList;
