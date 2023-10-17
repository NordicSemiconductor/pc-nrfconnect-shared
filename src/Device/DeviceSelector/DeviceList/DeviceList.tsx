/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Toggle } from '../../../Toggle/Toggle';
import classNames from '../../../utils/classNames';
import { getAutoReselect, setAutoReselect } from '../../deviceAutoSelectSlice';
import { displayedDeviceName } from '../../deviceInfo/deviceInfo';
import {
    Device as DeviceProps,
    getDevices,
    selectedDevice,
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

const sorted = (devices: DeviceProps[]) =>
    [...devices].sort((a, b) => {
        if (a.favorite !== b.favorite) {
            return a.favorite ? -1 : 1;
        }

        return displayedDeviceName(a) < displayedDeviceName(b) ? -1 : 1;
    });
interface Props {
    doSelectDevice: (device: DeviceProps, autoReselected: boolean) => void;
    isVisible: boolean;
    deviceFilter?: (device: DeviceProps) => boolean;
}

const DeviceList: FC<Props> = ({
    isVisible,
    doSelectDevice,
    deviceFilter = showAllDevices,
}) => {
    const dispatch = useDispatch();
    const autoReconnect = useSelector(getAutoReselect);
    const devices = useSelector(getDevices);
    const currentDevice = useSelector(selectedDevice);

    const sortedDevices = useMemo(
        () => sorted([...devices.values()]),
        [devices]
    );

    const filteredDevices = useMemo(
        () => sortedDevices.filter(deviceFilter),
        [deviceFilter, sortedDevices]
    );

    const canUseAutoReconnect =
        (!!currentDevice && !!currentDevice?.serialNumber) || !currentDevice;

    return (
        <div className={classNames('device-list', isVisible || 'hidden')}>
            <div className="global-auto-reconnect">
                <Toggle
                    id="toggle-global-auto-reconnect"
                    label="Auto Reconnect"
                    title={
                        !canUseAutoReconnect
                            ? 'Cannot auto reconnect to a device with no serial number'
                            : ''
                    }
                    disabled={!canUseAutoReconnect}
                    isToggled={
                        autoReconnect &&
                        ((!!currentDevice && !!currentDevice?.serialNumber) ||
                            !currentDevice)
                    }
                    onToggle={value => {
                        dispatch(setAutoReselect(value));
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
                            key={device.id.toString()}
                            itemKey={device.id.toString()}
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
