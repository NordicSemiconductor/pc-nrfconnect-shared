/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import PseudoButton from '../../PseudoButton/PseudoButton';
import { selectedVirtualDevice } from '../deviceSlice';

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
    deselectVirtualDevice,
    toggleDeviceListVisible,
}: {
    deselectVirtualDevice: () => void;
    toggleDeviceListVisible: () => void;
}) => {
    const virtualDevice = useSelector(selectedVirtualDevice);

    return (
        <PseudoButton
            className="selected-device"
            onClick={toggleDeviceListVisible}
        >
            {virtualDevice && (
                <div className="basic-device-info tw-h-[42px]">
                    <div className="icon">Logo</div>
                    <div className="details tw-flex tw-flex-col">
                        <div className="name">{virtualDevice}</div>
                        <div className="serial-number">Virtual Device</div>
                    </div>
                    <div className="tw-mr-2.5 tw-flex tw-h-full tw-w-11 tw-flex-col tw-items-center tw-justify-center">
                        <DisconnectDevice
                            doDeselectDevice={deselectVirtualDevice}
                        />
                    </div>
                </div>
            )}
        </PseudoButton>
    );
};
