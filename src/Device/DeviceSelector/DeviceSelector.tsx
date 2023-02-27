/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceTraits } from '@nordicsemiconductor/nrf-device-lib-js';

import { Device } from '../../state';
import useHotKey from '../../utils/useHotKey';
import {
    clearAutoReconnectTimeoutID,
    getWaitingToAutoReselect,
} from '../deviceAutoSelectSlice';
import { startWatchingDevices, stopWatchingDevices } from '../deviceLister';
import { DeviceSetup as DeviceSetupShared, setupDevice } from '../deviceSetup';
import DeviceSetup from '../DeviceSetup/DeviceSetup';
import {
    deselectDevice,
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
    deviceSetup?: DeviceSetupShared;
    releaseCurrentDevice?: () => void;
    onDeviceSelected?: (device: Device, autoReconnected: boolean) => void;
    onDeviceDeselected?: () => void;
    onDeviceConnected?: (device: Device) => void;
    onDeviceDisconnected?: (device: Device) => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
}

const noop = () => {};
export default ({
    deviceListing,
    deviceSetup,
    releaseCurrentDevice = noop,
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
    }, [dispatch, onDeviceDeselected]);

    const doSelectDevice = useCallback(
        (
            device: Device,
            autoReconnected: boolean,
            forcedAutoReconnected: boolean
        ) => {
            if (device.serialNumber === selectedSN) {
                setDeviceListVisible(false);
                return;
            }

            if (deviceIsSelected) {
                doDeselectDevice();
                return; // ??
            }

            dispatch(clearAutoReconnectTimeoutID());
            setDeviceListVisible(false);
            dispatch(selectDevice(device));
            onDeviceSelected(device, autoReconnected);
            if (deviceSetup) {
                dispatch(
                    setupDevice(
                        device,
                        deviceSetup,
                        releaseCurrentDevice,
                        onDeviceIsReady,
                        doDeselectDevice,
                        forcedAutoReconnected
                    )
                );
            }
        },
        [
            deviceIsSelected,
            deviceSetup,
            dispatch,
            doDeselectDevice,
            onDeviceIsReady,
            onDeviceSelected,
            releaseCurrentDevice,
            selectedSN,
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
                doSelectDevice={doSelectDevice}
                deviceFilter={deviceFilter}
            />
            <DeviceSetup />
        </div>
    );
};
