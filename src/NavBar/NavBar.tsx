/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';
import { node } from 'prop-types';

import Logo from '../Logo/Logo';
import NavMenu from './NavMenu';

import './nav-bar.scss';

const NavBar: FC<{ deviceSelect?: ReactNode }> = ({ deviceSelect }) => (
    <div className="core19-nav-bar">
        {deviceSelect && (
            <div className="core19-nav-bar-device-selector">{deviceSelect}</div>
        )}
        <NavMenu />
        <Logo changeWithDeviceState />
    </div>
);

NavBar.propTypes = {
    deviceSelect: node,
};

export default NavBar;
