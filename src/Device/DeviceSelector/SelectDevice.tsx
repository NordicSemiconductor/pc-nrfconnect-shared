/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import PseudoButton from '../../PseudoButton/PseudoButton';
import classNames from '../../utils/classNames';
import chevron from './arrow-down.svg';

import './select-device.scss';

interface Props {
    deviceListVisible: boolean;
    toggleDeviceListVisible: () => void;
}

export const SelectDevice: FC<Props> = ({
    deviceListVisible,
    toggleDeviceListVisible,
}) => (
    <PseudoButton
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

export default SelectDevice;
