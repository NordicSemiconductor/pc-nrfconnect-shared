/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';

import PseudoButton from '../../PseudoButton/PseudoButton';
import { selectedDevice } from '../deviceReducer';
import BasicDeviceInfo from './BasicDeviceInfo';

import './selected-device.scss';

const DisconnectDevice = ({ doDeselectDevice }) => (
    <PseudoButton
        className="mdi mdi-24px mdi-eject disconnect"
        onClick={doDeselectDevice}
        title="Disconnect device"
    />
);
DisconnectDevice.propTypes = {
    doDeselectDevice: func.isRequired,
};

const SelectedDevice = ({ doDeselectDevice, toggleDeviceListVisible }) => {
    const device = useSelector(selectedDevice);

    return (
        <PseudoButton
            className="selected-device"
            onClick={toggleDeviceListVisible}
        >
            <BasicDeviceInfo
                device={device}
                toggles={
                    <DisconnectDevice doDeselectDevice={doDeselectDevice} />
                }
            />
        </PseudoButton>
    );
};
SelectedDevice.propTypes = {
    doDeselectDevice: func.isRequired,
    toggleDeviceListVisible: func.isRequired,
};

export default SelectedDevice;
