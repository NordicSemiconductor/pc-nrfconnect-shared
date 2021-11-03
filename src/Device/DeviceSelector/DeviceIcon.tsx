/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import { Device } from '../../state';
import { deviceInfo } from '../deviceInfo/deviceInfo';

import './device-icon.scss';

const DeviceIcon: FC<{ device: Device }> = ({ device }) => {
    const Icon = deviceInfo(device).icon;
    return (
        <div className="icon">
            <Icon />
        </div>
    );
};

export default DeviceIcon;
