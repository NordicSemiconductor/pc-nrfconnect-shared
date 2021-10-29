/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useSelector } from 'react-redux';

import {
    currentPane as currentPaneSelector,
    paneNames as paneNamesSelector,
} from '../App/appLayout';
import NavMenuItem from './NavMenuItem';

const NavMenu = () => {
    const currentPane = useSelector(currentPaneSelector);
    const paneNames = useSelector(paneNamesSelector);

    return (
        <div data-testid="nav-menu">
            {paneNames.map((name, index) => (
                <NavMenuItem
                    key={name}
                    index={index}
                    isFirst={index === 0}
                    isSelected={currentPane === index}
                    label={name}
                />
            ))}
        </div>
    );
};

export default NavMenu;
