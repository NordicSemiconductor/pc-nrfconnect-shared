/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useSelector } from 'react-redux';
import { func } from 'prop-types';

import PseudoButton from '../../PseudoButton/PseudoButton';
import { getAutoReconnectDevice, selectedDevice } from '../deviceSlice';
import BasicDeviceInfo from './BasicDeviceInfo';

import './selected-device.scss';

const DisconnectDevice: FC<{ doDeselectDevice: () => void }> = ({
    doDeselectDevice,
}) => (
    <PseudoButton
        className="mdi mdi-24px mdi-eject disconnect"
        onClick={doDeselectDevice}
        title="Disconnect device"
        testId="disconnect-device"
    />
);
DisconnectDevice.propTypes = {
    doDeselectDevice: func.isRequired,
};

const SelectedDevice: FC<{
    doDeselectDevice: () => void;
    toggleDeviceListVisible: () => void;
}> = ({ doDeselectDevice, toggleDeviceListVisible }) => {
    const selDevice = useSelector(selectedDevice);
    const autoReconnectDevice = useSelector(getAutoReconnectDevice);
    const device = autoReconnectDevice ? autoReconnectDevice.device : selDevice;
    const reconnecting = autoReconnectDevice?.disconnectionTime !== undefined;

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
                />
            )}
        </PseudoButton>
    );
};
SelectedDevice.propTypes = {
    doDeselectDevice: func.isRequired,
    toggleDeviceListVisible: func.isRequired,
};

export default SelectedDevice;
