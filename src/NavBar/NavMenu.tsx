/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    currentPane as currentPaneSelector,
    paneNames as paneNamesSelector,
    switchToNextPane,
    switchToPreviousPane,
} from '../App/appLayout';
import useHotKey from '../utils/useHotKey';
import NavMenuItem from './NavMenuItem';

const NavMenu = () => {
    const currentPane = useSelector(currentPaneSelector);
    const paneNames = useSelector(paneNamesSelector);
    const dispatch = useDispatch();

    useHotKey({
        hotKey: 'ctrl+tab',
        title: 'Switch pane right',
        isGlobal: true,
        action: () => dispatch(switchToNextPane()),
    });

    useHotKey({
        hotKey: 'ctrl+shift+tab',
        title: 'Switch pane left',
        isGlobal: true,
        action: () => dispatch(switchToPreviousPane()),
    });

    return (
        <div data-testid="nav-menu">
            {paneNames.map((name, index: number) => (
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
