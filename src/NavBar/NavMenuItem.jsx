/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import Button from 'react-bootstrap/Button';
import { useDispatch } from 'react-redux';
import { bool, number, string } from 'prop-types';

import { setCurrentPane } from '../App/appLayout';
import classNames from '../utils/classNames';

import './nav-menu-item.scss';

const NavMenuItem = ({ index, isFirst, isSelected, label }) => {
    const dispatch = useDispatch();

    return (
        <Button
            variant="link"
            active={false}
            className={classNames(
                'core19-nav-menu-item',
                isSelected && 'selected',
                isFirst && 'first'
            )}
            onClick={() => dispatch(setCurrentPane(index))}
            type="button"
        >
            {label}
        </Button>
    );
};

NavMenuItem.propTypes = {
    index: number.isRequired,
    isFirst: bool.isRequired,
    isSelected: bool.isRequired,
    label: string.isRequired,
};

export default NavMenuItem;
