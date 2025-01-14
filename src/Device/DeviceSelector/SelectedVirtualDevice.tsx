/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import PseudoButton from '../../PseudoButton/PseudoButton';
import DisconnectDevice from './DisconnectDevice';

import './selected-device.scss';

export default ({
    virtualDevice,
    deselectVirtualDevice,
    toggleDeviceListVisible,
}: {
    virtualDevice: string;
    deselectVirtualDevice: () => void;
    toggleDeviceListVisible: () => void;
}) => (
    <PseudoButton
        className="tw-flex tw-h-10 tw-flex-row tw-items-center tw-bg-gray-700 tw-text-gray-50 hover:tw-bg-gray-600"
        onClick={toggleDeviceListVisible}
    >
        <span className="icon mdi mdi-flask-empty tw-text-2xl" />
        <div className="details tw-flex tw-flex-grow-[2] tw-flex-col">
            <p className="tw-m-0 tw-h-[17px] tw-text-sm/[14px] tw-font-bold">
                {virtualDevice}
            </p>
            <p className="tw-m-0 tw-text-[11px]/3 tw-uppercase group-hover:tw-text-gray-600">
                Virtual Device
            </p>
        </div>
        <div className="tw-mr-2.5 tw-flex tw-h-full tw-items-center tw-justify-center">
            <DisconnectDevice doDeselectDevice={deselectVirtualDevice} />
        </div>
    </PseudoButton>
);
