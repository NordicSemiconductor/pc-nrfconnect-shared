/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

import { setCurrentPane } from '../App/appLayout';
import classNames from '../utils/classNames';

import './nav-menu-item.scss';

interface Props {
    isSelected: boolean;
    label: string;
    disabled: boolean;
}

const NavMenuItem: FC<Props> = ({ isSelected, label, disabled }) => {
    const dispatch = useDispatch();

    return (
        <button
            type="button"
            className={classNames(
                'core19-nav-menu-item',
                isSelected && 'selected',
                'mr-4',
            )}
            onClick={() => dispatch(setCurrentPane(label))}
            disabled={disabled}
        >
            {label}
        </button>
    );
};

export default NavMenuItem;
