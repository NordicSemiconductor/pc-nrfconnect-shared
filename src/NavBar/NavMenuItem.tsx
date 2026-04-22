/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';

import { setCurrentPane } from '../App/appLayout';
import classNames from '../utils/classNames';

import './nav-menu-item.scss';

interface NavMenuItemProps
    extends Pick<
        React.ComponentPropsWithRef<'button'>,
        'ref' | 'className' | 'disabled'
    > {
    isSelected: boolean;
    children: string;
}

const NavMenuItem: React.FC<NavMenuItemProps> = ({
    isSelected,
    children,
    className,
    ...attrs
}) => {
    const dispatch = useDispatch();

    return (
        <button
            type="button"
            className={classNames(
                'core19-nav-menu-item',
                isSelected && 'selected',
                'mr-4',
                className,
            )}
            onClick={() => dispatch(setCurrentPane(children))}
            {...attrs}
        >
            {children}
        </button>
    );
};

export default NavMenuItem;
