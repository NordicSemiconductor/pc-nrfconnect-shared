/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';

import useHotKey from '../../utils/useHotKey';
import {
    getWaitingToAutoReselect,
    setAutoSelectDevice,
} from '../deviceAutoSelectSlice';
import {
    clearWaitForDevice,
    startWatchingDevices,
    stopWatchingDevices,
} from '../deviceLister';
import { DeviceSetupConfig, setupDevice } from '../deviceSetup';
import DeviceSetupView from '../DeviceSetup/DeviceSetupView';
import {
    deselectDevice,
    Device,
    deviceIsSelected as deviceIsSelectedSelector,
    selectDevice,
    selectedSerialNumber,
} from '../deviceSlice';
import DeviceList from './DeviceList/DeviceList';
import SelectDevice from './SelectDevice';
import SelectedDevice from './SelectedDevice';

interface OutdatedDeviceTraits {
    serialPort?: boolean;
    serialport?: boolean;
}

export interface Props {
    deviceListing: DeviceTraits & OutdatedDeviceTraits;
    deviceSetupConfig?: DeviceSetupConfig;
    onDeviceSelected?: (device: Device, autoReselected: boolean) => void;
    onDeviceDeselected?: () => void;
    onDeviceConnected?: (device: Device) => void;
    onDeviceDisconnected?: (device: Device) => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
}

const noop = () => {};
export default ({
    deviceListing,
    deviceSetupConfig,
    onDeviceSelected = noop,
    onDeviceDeselected = noop,
    onDeviceConnected = noop,
    onDeviceDisconnected = noop,
    onDeviceIsReady = noop,
    deviceFilter,
}: Props) => {
    const dispatch = useDispatch();
    const [deviceListVisible, setDeviceListVisible] = useState(false);

    const deviceIsSelected = useSelector(deviceIsSelectedSelector);
    const selectedSN = useSelector(selectedSerialNumber);
    const waitingToAutoReconnect = useSelector(getWaitingToAutoReselect);
    const showSelectedDevice = deviceIsSelected || waitingToAutoReconnect;

    const doDeselectDevice = useCallback(() => {
        onDeviceDeselected();
        dispatch(deselectDevice());
        dispatch(clearWaitForDevice());
        dispatch(setAutoSelectDevice(undefined));
    }, [dispatch, onDeviceDeselected]);

    // Ensure that useCallback is
    // not updated frequently as this
    // will have a side effect to stop and start the hotplug events
    const doSelectDevice = useCallback(
        (device: Device, autoReselected: boolean) => {
            dispatch(clearWaitForDevice());
            setDeviceListVisible(false);
            dispatch(selectDevice(device));
            dispatch(setAutoSelectDevice(device));
            onDeviceSelected(device, autoReselected);
            if (deviceSetupConfig) {
                dispatch(
                    setupDevice(
                        device,
                        deviceSetupConfig,
                        onDeviceIsReady,
                        doDeselectDevice
                    )
                );
            }
        },
        [
            deviceSetupConfig,
            dispatch,
            doDeselectDevice,
            onDeviceIsReady,
            onDeviceSelected,
        ]
    );

    const doStartWatchingDevices = useCallback(() => {
        const patchedDeviceListing = {
            serialPorts: deviceListing.serialPort || deviceListing.serialport,
            ...deviceListing,
        };
        dispatch(
            startWatchingDevices(
                patchedDeviceListing,
                onDeviceConnected,
                onDeviceDisconnected,
                onDeviceDeselected,
                doSelectDevice
            )
        );
    }, [
        deviceListing,
        dispatch,
        onDeviceConnected,
        onDeviceDisconnected,
        onDeviceDeselected,
        doSelectDevice,
    ]);

    const toggleDeviceListVisible = () =>
        setDeviceListVisible(!deviceListVisible);

    useEffect(() => {
        doStartWatchingDevices();
        return stopWatchingDevices;
    }, [doStartWatchingDevices]);

    useHotKey({
        hotKey: 'alt+s',
        title: 'Select device',
        isGlobal: true,
        action: () => toggleDeviceListVisible(),
    });

    return (
        <div className="core19-device-selector">
            {showSelectedDevice ? (
                <SelectedDevice
                    doDeselectDevice={doDeselectDevice}
                    toggleDeviceListVisible={toggleDeviceListVisible}
                />
            ) : (
                <SelectDevice
                    deviceListVisible={deviceListVisible}
                    toggleDeviceListVisible={toggleDeviceListVisible}
                />
            )}
            <DeviceList
                isVisible={deviceListVisible}
                doSelectDevice={(device, autoReselected) => {
                    if (device.serialNumber === selectedSN) {
                        setDeviceListVisible(false);
                        return;
                    }

                    if (deviceIsSelected) {
                        doDeselectDevice();
                    }

                    doSelectDevice(device, autoReselected);
                }}
                deviceFilter={deviceFilter}
            />
            <DeviceSetupView />
        </div>
    );
};
