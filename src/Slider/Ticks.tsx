/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import lodashRange from 'lodash.range';
import { exact, number } from 'prop-types';

import classNames from '../utils/classNames';
import rangeShape, { RangeProp } from './rangeShape';

import './ticks.scss';

interface Props {
    range: RangeProp;
    valueRange: { min: number; max: number };
}

const Ticks: FC<Props> = ({
    valueRange,
    range: { min, max, decimals = 0, step = null, explicitRange = [] },
}) => {

    const computedStep = (step === null? 0.1 ** (decimals as number): step);

    const isSelected = (value: number) =>
        value >= valueRange.min && value <= valueRange.max;

    if (explicitRange.length > 0) {
        console.error("Explicit Range is set but this functionality has not been impliment yet for Ticks. Expect the spacing between Ticks to be incorrect");
    }

    return (
        <div className="ticks">
            {lodashRange(min, max + computedStep, computedStep).map(value => (
                <div
                    key={String(value)}
                    className={classNames(
                        'tick',
                        isSelected(value) && 'selected'
                    )}
                />
            ))}
        </div>
    );
};
Ticks.propTypes = {
    range: rangeShape.isRequired,
    valueRange: exact({ min: number.isRequired, max: number.isRequired })
        .isRequired,
};

export default Ticks;
