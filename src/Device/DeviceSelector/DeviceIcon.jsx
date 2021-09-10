/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { deviceInfo } from '../deviceInfo/deviceInfo';
import deviceShape from './deviceShape';

import './device-icon.scss';

const DeviceIcon = ({ device }) => {
    const Icon = deviceInfo(device).icon;
    return (
        <div className="icon">
            <Icon />
        </div>
    );
};
DeviceIcon.propTypes = {
    device: deviceShape,
};

export default DeviceIcon;
