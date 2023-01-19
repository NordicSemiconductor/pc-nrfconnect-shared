/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useSelector } from 'react-redux';

import { deviceIsSelected as deviceIsSelectedSelector } from '../Device/deviceSlice';
import { openUrl } from '../utils/open';
import logoConnected from './nordic-logo-blue-icon-only.png';
import logoDisconnected from './nordic-logo-gray-icon-only.png';
import logoUniform from './nordic-logo-white-icon-only.png';

import './logo.scss';

const goToNRFConnectWebsite = () =>
    openUrl('http://www.nordicsemi.com/nRFConnect');

const LogoImage: FC<{ src: string }> = ({ src }) => (
    <img
        className="core19-logo"
        src={src}
        alt="Nordic Semiconductor logo"
        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
        role="link"
        onClick={goToNRFConnectWebsite}
        onKeyPress={() => {}}
        tabIndex={0}
    />
);

const DynamicLogo = () => {
    const deviceIsSelected = useSelector(deviceIsSelectedSelector);

    return (
        <LogoImage src={deviceIsSelected ? logoConnected : logoDisconnected} />
    );
};

const StaticLogo = () => <LogoImage src={logoUniform} />;

const Logo: FC<{ changeWithDeviceState?: boolean }> = ({
    changeWithDeviceState = false,
}) => (changeWithDeviceState ? <DynamicLogo /> : <StaticLogo />);

export default Logo;
