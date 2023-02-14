/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import PseudoButton from '../../PseudoButton/PseudoButton';
import {
    getAutoReconnectDevice,
    getWaitingToAutoReconnect,
    selectedDevice,
} from '../deviceSlice';
import BasicDeviceInfo from './BasicDeviceInfo';

import './selected-device.scss';

const DisconnectDevice = ({
    doDeselectDevice,
}: {
    doDeselectDevice: () => void;
}) => (
    <PseudoButton
        className="mdi mdi-24px mdi-eject disconnect"
        onClick={doDeselectDevice}
        title="Disconnect device"
        testId="disconnect-device"
    />
);

export default ({
    doDeselectDevice,
    toggleDeviceListVisible,
}: {
    doDeselectDevice: () => void;
    toggleDeviceListVisible: () => void;
}) => {
    const reconnecting = useSelector(getWaitingToAutoReconnect);
    const selDevice = useSelector(selectedDevice);
    const autoReconnectDevice = useSelector(getAutoReconnectDevice);
    const device = autoReconnectDevice ? autoReconnectDevice.device : selDevice;

    return (
        <PseudoButton
            className={`selected-device ${reconnecting ? 'reconnecting' : ''}`}
            onClick={toggleDeviceListVisible}
        >
            {device && (
                <BasicDeviceInfo
                    device={device}
                    toggles={
                        <DisconnectDevice doDeselectDevice={doDeselectDevice} />
                    }
                    showReconnecting
                />
            )}
        </PseudoButton>
    );
};
