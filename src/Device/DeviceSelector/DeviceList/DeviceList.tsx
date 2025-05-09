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
import VirtualDevices from './VirtualDevices';

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
        if (!!a.favorite !== !!b.favorite) {
            return a.favorite ? -1 : 1;
        }

        return displayedDeviceName(a) < displayedDeviceName(b) ? -1 : 1;
    });
interface Props {
    doSelectDevice: (device: DeviceProps, autoReselected: boolean) => void;
    doSelectVirtualDevice: (device: string) => void;
    isVisible: boolean;
    deviceFilter?: (device: DeviceProps) => boolean;
    virtualDevices?: string[];
}

const DeviceList: FC<Props> = ({
    isVisible,
    doSelectDevice,
    doSelectVirtualDevice,
    deviceFilter = showAllDevices,
    virtualDevices = [],
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
        <div
            className={classNames(
                'device-list-container',
                isVisible || 'hidden'
            )}
        >
            <div className="tw-flex tw-h-full tw-flex-col tw-overflow-y-hidden">
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
                            ((!!currentDevice &&
                                !!currentDevice?.serialNumber) ||
                                !currentDevice)
                        }
                        onToggle={value => {
                            dispatch(setAutoReselect(value));
                        }}
                    />
                </div>
                <div className="device-list tw-h-full">
                    {sortedDevices.length === 0 && <NoDevicesConnected />}
                    {sortedDevices.length > 0 &&
                    filteredDevices.length === 0 ? (
                        <NoSupportedDevicesConnected />
                    ) : (
                        <AnimatedList devices={sortedDevices}>
                            {filteredDevices.map(device => (
                                <AnimatedItem
                                    key={device.id.toString()}
                                    itemKey={device.id.toString()}
                                    isOnlyChild={filteredDevices.length === 1}
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
            </div>
            {virtualDevices.length > 0 && (
                <VirtualDevices
                    virtualDevices={virtualDevices}
                    visibleAndNoDevicesConnected={
                        isVisible && filteredDevices.length === 0
                    }
                    doSelectVirtualDevice={doSelectVirtualDevice}
                />
            )}
        </div>
    );
};

export default DeviceList;
