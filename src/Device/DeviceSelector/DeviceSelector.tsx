/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeviceListing } from 'pc-nrfconnect-shared';

import { Device } from '../../state';
import { startWatchingDevices, stopWatchingDevices } from '../deviceLister';
import { DeviceSetup as DeviceSetupShared, setupDevice } from '../deviceSetup';
import DeviceSetup from '../DeviceSetup/DeviceSetup';
import {
    deselectDevice,
    deviceIsSelected as deviceIsSelectedSelector,
    selectDevice,
} from '../deviceSlice';
import DeviceList from './DeviceList/DeviceList';
import { SelectDevice } from './SelectDevice';
import SelectedDevice from './SelectedDevice';
import useAutoselectDevice from './useAutoselectDevice';

interface Props {
    deviceListing: DeviceListing;
    deviceSetup?: DeviceSetupShared;
    releaseCurrentDevice?: () => void;
    onDeviceSelected?: (device: Device) => void;
    onDeviceDeselected?: () => void;
    onDeviceIsReady?: (device: Device) => void;
    deviceFilter?: (device: Device) => boolean;
}

const noop = () => {};
const DeviceSelector: FC<Props> = ({
    deviceListing,
    deviceSetup,
    releaseCurrentDevice = noop,
    onDeviceSelected = noop,
    onDeviceDeselected = noop,
    onDeviceIsReady = noop,
    deviceFilter,
}) => {
    const dispatch = useDispatch();
    const [deviceListVisible, setDeviceListVisible] = useState(false);

    const deviceIsSelected = useSelector(deviceIsSelectedSelector);

    const doDeselectDevice = useCallback(() => {
        onDeviceDeselected();
        dispatch(deselectDevice());
    }, [dispatch, onDeviceDeselected]);

    const doStartWatchingDevices = useCallback(
        () => dispatch(startWatchingDevices(deviceListing, doDeselectDevice)),
        [deviceListing, dispatch, doDeselectDevice]
    );

    const doSelectDevice = (device: Device) => {
        setDeviceListVisible(false);
        dispatch(selectDevice(device));
        onDeviceSelected(device);
        if (deviceSetup) {
            dispatch(
                setupDevice(
                    device,
                    deviceSetup,
                    releaseCurrentDevice,
                    onDeviceIsReady,
                    doStartWatchingDevices,
                    doDeselectDevice
                )
            );
        }
    };

    const toggleDeviceListVisible = () =>
        setDeviceListVisible(!deviceListVisible);

    useEffect(() => {
        doStartWatchingDevices();
        return stopWatchingDevices;
    }, [doStartWatchingDevices]);

    useAutoselectDevice(doSelectDevice);

    return (
        <div className="core19-device-selector">
            {deviceIsSelected ? (
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

export default DeviceSelector;
