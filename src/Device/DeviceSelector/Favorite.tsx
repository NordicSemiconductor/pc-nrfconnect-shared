/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useDispatch } from 'react-redux';

import PseudoButton from '../../PseudoButton/PseudoButton';
import classNames from '../../utils/classNames';
import { Device, toggleDeviceFavorited } from '../deviceSlice';

export const MakeDeviceFavorite: FC<{ device: Device }> = ({ device }) => {
    const dispatch = useDispatch();

    const toggleFavorite = () => {
        dispatch(toggleDeviceFavorited(device));
    };

    return (
        <PseudoButton className="tw-mr-[1ex]" onClick={toggleFavorite}>
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

    return device ? (
        <PseudoButton
            className={classNames(
                !device.favorite && 'tw-hidden hover:tw-visible',
                `mdi ${device.favorite ? 'mdi-star' : 'mdi-star-outline'}`
            )}
            onClick={toggleFavorite}
        />
    ) : null;
};
