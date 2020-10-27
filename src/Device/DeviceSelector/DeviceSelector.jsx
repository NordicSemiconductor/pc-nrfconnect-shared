/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { bool, exact, func, object } from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';

import {
    deselectDevice,
    selectDevice,
    setupDevice,
    startWatchingDevices,
    stopWatchingDevices,
} from '../deviceActions';
import { deviceIsSelected as deviceIsSelectedSelector } from '../deviceReducer';
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
    }),
    releaseCurrentDevice: func, // () => {}
    onDeviceSelected: func, // (device) => {}
    onDeviceDeselected: func, // () => {}
    onDeviceIsReady: func, // (device) => {}
};

export default DeviceSelector;
