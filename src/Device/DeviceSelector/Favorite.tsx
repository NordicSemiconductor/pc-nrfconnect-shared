/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

import PseudoButton from '../../PseudoButton/PseudoButton';
import { Device } from '../../state';
import { toggleDeviceFavorited } from '../deviceSlice';

import './favorite.scss';

export const MakeDeviceFavorite: FC<{ device: Device }> = ({ device }) => {
    const dispatch = useDispatch();

    const toggleFavorite = () => {
        dispatch(toggleDeviceFavorited(device));
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

export const FavoriteIndicator: FC<{ device: Device }> = ({ device }) => {
    const dispatch = useDispatch();

    const toggleFavorite = () => {
        dispatch(toggleDeviceFavorited(device));
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
