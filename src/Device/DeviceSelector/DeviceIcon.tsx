/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type FC } from 'react';

import { deviceInfo } from '../deviceInfo/deviceInfo';
import { type Device } from '../deviceSlice';

import './device-icon.scss';

const DeviceIcon: FC<{ device: Device }> = ({ device }) => {
    const Icon = deviceInfo(device).icon;
    return (
        <div className="icon">
            {device.traits.broken ? (
                <span className="mdi mdi-alert" />
            ) : (
                <Icon />
            )}
        </div>
    );
};

export default DeviceIcon;
