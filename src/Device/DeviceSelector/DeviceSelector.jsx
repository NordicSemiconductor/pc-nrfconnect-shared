/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { bool, exact, func, object } from 'prop-types';

import { deselectDevice, selectDevice } from '../deviceActions';
import { startWatchingDevices, stopWatchingDevices } from '../deviceLister';
import { deviceIsSelected as deviceIsSelectedSelector } from '../deviceReducer';
import { setupDevice } from '../deviceSetup';
import DeviceSetup from '../DeviceSetup/DeviceSetup';
import DeviceList from './DeviceList/DeviceList';
import SelectDevice from './SelectDevice';
import SelectedDevice from './SelectedDevice';
import useAutoselectDevice from './useAutoselectDevice';

const noop = () => {};
const DeviceSelector = ({
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

    const doSelectDevice = device => {
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

DeviceSelector.propTypes = {
    deviceListing: exact({
        usb: bool,
        nordicUsb: bool,
        seggerUsb: bool,
        nordicDfu: bool,
        serialport: bool,
        jlink: bool,
    }).isRequired,
    deviceSetup: exact({
        jprog: object,
        dfu: object,
        needSerialport: bool,
        allowCustomDevice: bool,
    }),
    releaseCurrentDevice: func, // () => {}
    onDeviceSelected: func, // (device) => {}
    onDeviceDeselected: func, // () => {}
    onDeviceIsReady: func, // (device) => {}
    deviceFilter: func, // (device) => boolean
};

export default DeviceSelector;
