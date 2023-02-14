/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import PseudoButton from '../../PseudoButton/PseudoButton';
import classNames from '../../utils/classNames';
import chevron from './arrow-down.svg';

import './select-device.scss';

interface Props {
    deviceListVisible: boolean;
    toggleDeviceListVisible: () => void;
}

export default ({ deviceListVisible, toggleDeviceListVisible }: Props) => (
    <PseudoButton
        title="alt+s"
        className={classNames(
            'select-device',
            deviceListVisible && 'device-list-visible'
        )}
        onClick={toggleDeviceListVisible}
    >
        <div>Select device</div>
        <img
            className={classNames(deviceListVisible && 'img-rotate')}
            src={chevron}
            alt=""
        />
    </PseudoButton>
);
