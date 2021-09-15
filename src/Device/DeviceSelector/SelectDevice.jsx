/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, func } from 'prop-types';

import PseudoButton from '../../PseudoButton/PseudoButton';
import classNames from '../../utils/classNames';

import './select-device.scss';

const SelectDevice = ({ deviceListVisible, toggleDeviceListVisible }) => (
    <PseudoButton
        className={classNames(
            'select-device',
            deviceListVisible && 'device-list-visible'
        )}
        onClick={toggleDeviceListVisible}
    >
        <div>Select device</div>
    </PseudoButton>
);
SelectDevice.propTypes = {
    deviceListVisible: bool.isRequired,
    toggleDeviceListVisible: func.isRequired,
};

export default SelectDevice;
