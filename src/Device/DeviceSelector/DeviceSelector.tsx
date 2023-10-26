/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { NrfutilDeviceLib } from '../../../nrfutil';
import { DeviceTraits } from '../../../nrfutil/device/common';
import logger from '../../logging';
import useHotKey from '../../utils/useHotKey';
import {
    clearWaitForDevice,
    getWaitingToAutoReselect,
    setAutoSelectDevice,
} from '../deviceAutoSelectSlice';
import { startWatchingDevices, stopWatchingDevices } from '../deviceLister';
import { DeviceSetupConfig, setupDevice } from '../deviceSetup';
import DeviceSetupView from '../DeviceSetup/DeviceSetupView';
import {
    deselectDevice,
    Device,
    deviceIsSelected as deviceIsSelectedSelector,
    selectDevice,
    selectedDevice,
    setSelectedDeviceInfo,
} from '../deviceSlice';
import DeviceList from './DeviceList/DeviceList';
import SelectDevice from './SelectDevice';
import SelectedDevice from './SelectedDevice';

export interface Props {
    deviceListing: DeviceTraits;
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
    const currentDevice = useSelector(selectedDevice);
    const waitingToAutoReconnect = useSelector(getWaitingToAutoReselect);
    const showSelectedDevice = deviceIsSelected || waitingToAutoReconnect;

    const doDeselectDevice = useCallback(() => {
        dispatch(clearWaitForDevice());
        dispatch(setAutoSelectDevice(undefined));
        onDeviceDeselected();
        dispatch(deselectDevice());
    }, [dispatch, onDeviceDeselected]);

    const abortController = useRef<AbortController>();

    // Ensure that useCallback is
    // not updated frequently as this
    // will have a side effect to stop and start the hotplug events
    const doSelectDevice = useCallback(
        async (device: Device, autoReselected: boolean) => {
            dispatch(clearWaitForDevice());
            setDeviceListVisible(false);
            dispatch(selectDevice(device));
            dispatch(setAutoSelectDevice(device));
            onDeviceSelected(device, autoReselected);

            abortController.current?.abort();
            abortController.current = new AbortController();
            const deviceInfo = await NrfutilDeviceLib.deviceInfo(
                device,
                undefined,
                undefined,
                abortController.current
            );
            abortController.current = undefined;
            setSelectedDeviceInfo(deviceInfo);

            if (deviceSetupConfig) {
                if (device.serialNumber) {
                    dispatch(
                        setupDevice(
                            device,
                            deviceSetupConfig,
                            onDeviceIsReady,
                            doDeselectDevice,
                            deviceInfo
                        )
                    );
                } else {
                    logger.warn(
                        `Selected device has no serial number. Device setup is not supported`
                    );
                    onDeviceIsReady(device);
                }
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
        dispatch(
            startWatchingDevices(
                deviceListing,
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
                    if (device.id === currentDevice?.id) {
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
