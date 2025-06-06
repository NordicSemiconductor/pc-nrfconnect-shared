/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import PseudoButton from '../../PseudoButton/PseudoButton';
import {
    getAutoReselectDevice,
    getWaitingForDeviceTimeout,
    getWaitingToAutoReselect,
} from '../deviceAutoSelectSlice';
import { selectedDevice } from '../deviceSlice';
import BasicDeviceInfo from './BasicDeviceInfo';
import DisconnectDevice from './DisconnectDevice';

import './selected-device.scss';

export default ({
    doDeselectDevice,
    toggleDeviceListVisible,
}: {
    doDeselectDevice: () => void;
    toggleDeviceListVisible: () => void;
}) => {
    const waitingForAutoReselect = useSelector(getWaitingToAutoReselect);
    const waitingForDevice = useSelector(getWaitingForDeviceTimeout);
    const selDevice = useSelector(selectedDevice);
    const autoReconnectDevice = useSelector(getAutoReselectDevice);
    const device = selDevice ?? autoReconnectDevice;

    return (
        <PseudoButton
            className={`selected-device ${
                waitingForAutoReselect || waitingForDevice ? 'reconnecting' : ''
            }`}
            onClick={toggleDeviceListVisible}
        >
            {device && (
                <BasicDeviceInfo
                    device={device}
                    toggles={
                        <DisconnectDevice doDeselectDevice={doDeselectDevice} />
                    }
                    showWaitingStatus
                />
            )}
        </PseudoButton>
    );
};
