/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch } from 'react-redux';
import { bool, func } from 'prop-types';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import { Device as DeviceProps } from '../../../state';
import { showDialog } from '../../BrokenDeviceDialog/brokenDeviceDialogSlice';
import BasicDeviceInfo from '../BasicDeviceInfo';

import './broken-device.scss';

const ShowMoreInfo: FC<{ isVisible: boolean; toggleVisible: () => void }> = ({
    isVisible,
    toggleVisible,
}) => (
    <PseudoButton
        className={`show-more mdi mdi-chevron-${isVisible ? 'up' : 'down'}`}
        testId="show-more-device-info"
        onClick={toggleVisible}
    />
);

ShowMoreInfo.propTypes = {
    isVisible: bool.isRequired,
    toggleVisible: func.isRequired,
};

interface Props {
    device: DeviceProps;
}

const Device: FC<Props> = ({ device }) => {
    const dispatch = useDispatch();

    return (
        <PseudoButton
            className="broken-device"
            onClick={() => dispatch(showDialog(device.broken))}
        >
            <BasicDeviceInfo device={device} />
            <div className="broken-device-info">
                <p>Unusable device detected </p>
                <p>
                    <u>More information</u>
                </p>
            </div>
        </PseudoButton>
    );
};

export default Device;
