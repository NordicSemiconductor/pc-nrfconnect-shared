/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
    currentPane as currentPaneSelector,
    panes as panesSelector,
    switchToNextPane,
    switchToPreviousPane,
} from '../App/appLayout';
import useHotKey from '../utils/useHotKey';
import NavMenuItem from './NavMenuItem';

const NavMenu = () => {
    const currentPane = useSelector(currentPaneSelector);
    const panes = useSelector(panesSelector);
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
        <div data-testid="nav-menu" className="d-flex ml-3 flex-wrap">
            {panes.map(pane => (
                <NavMenuItem
                    key={pane.name}
                    isSelected={currentPane === pane.name}
                    label={pane.name}
                    disabled={pane.disabled}
                />
            ))}
        </div>
    );
};

export default NavMenu;
