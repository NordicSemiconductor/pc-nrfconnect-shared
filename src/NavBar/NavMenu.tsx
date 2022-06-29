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
    setCurrentPane,
} from '../App/appLayout';
import { useHotkey } from '../Shortcuts/useHotkey';
import NavMenuItem from './NavMenuItem';

const NavMenu = () => {
    const currentPane = useSelector(currentPaneSelector);
    const paneNames = useSelector(paneNamesSelector);
    const dispatch = useDispatch();

    useHotkey({
        hotKey: 'ctrl+tab',
        title: 'Switch pane',
        isGlobal: true,
        action: () => {
            currentPane === paneNames.length - 1
                ? dispatch(setCurrentPane(0))
                : dispatch(setCurrentPane(currentPane + 1));
        },
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
