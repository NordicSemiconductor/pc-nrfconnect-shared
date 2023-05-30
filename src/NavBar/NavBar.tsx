/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import Logo from '../Logo/Logo';
import NavMenu from './NavMenu';

import './nav-bar.scss';

export default ({ deviceSelect }: { deviceSelect?: ReactNode }) => (
    <div className="core19-nav-bar">
        {deviceSelect && (
            <div className="core19-nav-bar-device-selector">{deviceSelect}</div>
        )}
        <NavMenu />
        <Logo changeWithDeviceState />
    </div>
);
