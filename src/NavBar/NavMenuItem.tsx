/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

import { setCurrentPane } from '../App/appLayout';
import Button from '../Button/Button';
import classNames from '../utils/classNames';

import './nav-menu-item.scss';

interface Props {
    index: number;
    isSelected: boolean;
    label: string;
}

const NavMenuItem: FC<Props> = ({ index, isSelected, label }) => {
    const dispatch = useDispatch();

    return (
        <Button
            variant="custom"
            className={classNames(
                'core19-nav-menu-item',
                isSelected && 'selected',
                'mr-4'
            )}
            onClick={() => dispatch(setCurrentPane(index))}
        >
            {label}
        </Button>
    );
};

export default NavMenuItem;
