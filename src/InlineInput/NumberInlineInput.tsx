/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import { isFactor } from '../Slider/factor';
import { RangeProp } from '../Slider/rangeShape';
import InlineInput from './InlineInput';

import './number-inline-input.scss';

const isInRange = (
    value: number,
    { min, max, decimals = 0, step = 0, explicitRange = [] }: RangeProp
) =>
    value >= min &&
    value <= max &&
    value === Number(value.toFixed(decimals)) &&
    (step > 0 ? isFactor(value, step) : true) &&
    (explicitRange.length > 0 ? explicitRange.indexOf(value) !== -1 : true);

interface Props {
    disabled?: boolean;
    value: number;
    range: RangeProp;
    onChange: (number: number) => void;
    onChangeComplete?: (number: number) => void;
}

const incrementValue = (
    current: number,
    range: RangeProp,
    steps: number,
    action: (v: number) => void
) => {
    if (steps === 0) return;

    if (
        typeof range.explicitRange !== 'undefined' &&
        range.explicitRange.length > 0
    ) {
        const currentIndex = range.explicitRange.indexOf(current);
        const newIndex = currentIndex + steps;

        if (newIndex >= 0 && newIndex < range.explicitRange.length) {
            action(range.explicitRange[newIndex]);
        }

        return;
    }

    const decimal =
        range.decimals && typeof range.decimals !== 'undefined'
            ? range.decimals
            : 0;
    const stepValue =
        range.step && typeof range.step !== 'undefined'
            ? range.step
            : 0.1 ** decimal;
    const newValue = Number((current + steps * stepValue).toFixed(decimal));

    if (newValue >= range.min && newValue <= range.max) {
        action(newValue);
    }
};

const NumberInlineInput: FC<Props> = ({
    disabled,
    value,
    range,
    onChange,
    onChangeComplete = () => {},
}) => (
    <InlineInput
        className="number-inline-input"
        disabled={disabled}
        value={String(value)}
        isValid={newValue => isInRange(Number(newValue), range)}
        onChange={newValue => onChange(Number(newValue))}
        onChangeComplete={newValue => onChangeComplete(Number(newValue))}
        onKeyboardIncrementAction={() =>
            incrementValue(value, range, 1, onChange)
        }
        onKeyboardDecrementAction={() =>
            incrementValue(value, range, -1, onChange)
        }
    />
);

export default NumberInlineInput;
