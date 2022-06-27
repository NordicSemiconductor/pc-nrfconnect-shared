/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import PseudoButton from '../../PseudoButton/PseudoButton';
import { useHotkey } from '../../Shortcuts/useHotkey';
import classNames from '../../utils/classNames';
import chevron from './arrow-down.svg';

import './select-device.scss';

interface Props {
    deviceListVisible: boolean;
    toggleDeviceListVisible: () => void;
}

const SelectDevice: FC<Props> = ({
    deviceListVisible,
    toggleDeviceListVisible,
}) => {
    useHotkey({
        hotKey: 'alt+s',
        title: 'Select device',
        description: 'Shows the list of devices',
        isGlobal: true,
        action: () => toggleDeviceListVisible(),
    });

    return (
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
};

export default SelectDevice;
