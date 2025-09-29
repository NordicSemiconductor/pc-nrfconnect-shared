/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useEffect } from 'react';
import lodashRange from 'lodash.range';

import classNames from '../utils/classNames';
import { getStep, isValues, RangeOrValues } from './range';

import './ticks.scss';

interface Props {
    range: RangeOrValues;
    valueRange: { min: number; max: number };
}

const Ticks: FC<Props> = ({ valueRange, range: rangeOrValues }) => {
    useEffect(() => {
        if (isValues(rangeOrValues)) {
            console.error(
                'Ticks are not yet implemented for explicit values. Not showing ticks.',
            );
        }
    }, [rangeOrValues]);

    if (isValues(rangeOrValues)) {
        return null;
    }

    const range = rangeOrValues;

    const step = getStep(range);
    const isSelected = (value: number) =>
        value >= valueRange.min && value <= valueRange.max;

    return (
        <div className="ticks">
            {lodashRange(range.min, range.max + step, step).map(value => (
                <div
                    key={String(value)}
                    className={classNames(
                        'tick',
                        isSelected(value) && 'selected',
                    )}
                />
            ))}
        </div>
    );
};

export default Ticks;
