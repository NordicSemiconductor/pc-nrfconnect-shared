/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { useDispatch } from 'react-redux';

import PseudoButton from '../../PseudoButton/PseudoButton';
import { toggleDeviceFavorited } from '../deviceSlice';
import deviceShape from './deviceShape';

import './favorite.scss';

export const MakeDeviceFavorite = ({ device }) => {
    const dispatch = useDispatch();

    const toggleFavorite = () => {
        dispatch(toggleDeviceFavorited(device.serialNumber));
    };

    return (
        <PseudoButton className="make-favorite" onClick={toggleFavorite}>
            <span
                className={`mdi star ${
                    device.favorite ? 'mdi-star-off' : 'mdi-star'
                }`}
            />
            {device.favorite ? 'Un-favorite' : 'Favorite'}
        </PseudoButton>
    );
};
MakeDeviceFavorite.propTypes = {
    device: deviceShape.isRequired,
};

export const FavoriteIndicator = ({ device }) => {
    const dispatch = useDispatch();

    const toggleFavorite = () => {
        dispatch(toggleDeviceFavorited(device.serialNumber));
    };

    return (
        <PseudoButton
            className={`mdi ${
                device.favorite ? 'mdi-star' : 'mdi-star-outline'
            }`}
            onClick={toggleFavorite}
        />
    );
};
FavoriteIndicator.propTypes = {
    device: deviceShape.isRequired,
};
