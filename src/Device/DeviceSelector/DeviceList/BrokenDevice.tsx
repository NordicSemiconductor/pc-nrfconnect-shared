/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';

import PseudoButton from '../../../PseudoButton/PseudoButton';
import { showDialog } from '../../BrokenDeviceDialog/brokenDeviceDialogSlice';
import { type Device as DeviceProps } from '../../deviceSlice';
import BasicDeviceInfo from '../BasicDeviceInfo';

import './broken-device.scss';

export default ({ device }: { device: DeviceProps }) => {
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
