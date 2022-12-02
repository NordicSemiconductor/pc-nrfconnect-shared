/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';

import { isFactor } from '../Slider/factor';
import {
    getStep,
    isValues,
    Range,
    RangeOrValues,
    useValidatedRangeOrValues,
    Values,
} from '../Slider/range';
import InlineInput from './InlineInput';

import './number-inline-input.scss';

export interface Props {
    disabled?: boolean;
    value: number;
    range: RangeOrValues;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
}

const isInValues = (value: number, values: Values) => values.includes(value);

const isInRange = (value: number, { min, max, decimals, step }: Range) =>
    value >= min &&
    value <= max &&
    value === Number(value.toFixed(decimals)) &&
    (step == null ? true : isFactor(value - min, step));

const isValid = (value: number, rangeOrValues: RangeOrValues) =>
    isValues(rangeOrValues)
        ? isInValues(value, rangeOrValues)
        : isInRange(value, rangeOrValues);

const nextInValues = (
    current: number,
    values: Values,
    steps: number
): number | undefined => {
    const currentIndex = values.indexOf(current);
    const newIndex = currentIndex + steps;

    return values[newIndex];
};

const nextInRange = (current: number, range: Range, steps: number) => {
    const newValue = Number(
        (current + steps * getStep(range)).toFixed(range.decimals)
    );

    if (newValue >= range.min && newValue <= range.max) {
        return newValue;
    }
};

const changeValueStepwise = (
    current: number,
    rangeOrValues: RangeOrValues,
    steps: number,
    action: (v: number) => void
) => {
    const nextValue = isValues(rangeOrValues)
        ? nextInValues(current, rangeOrValues, steps)
        : nextInRange(current, rangeOrValues, steps);

    if (nextValue != null) {
        action(nextValue);
    }
};

const NumberInlineInput: FC<Props> = ({
    disabled,
    value,
    range,
    onChange,
    onChangeComplete = () => {},
}) => {
    useValidatedRangeOrValues(range);

    return (
        <InlineInput
            className="number-inline-input"
            disabled={disabled}
            value={String(value)}
            isValid={newValue => isValid(Number(newValue), range)}
            onChange={newValue => onChange(Number(newValue))}
            onChangeComplete={newValue => onChangeComplete(Number(newValue))}
            onKeyboardIncrementAction={() =>
                changeValueStepwise(value, range, 1, onChange)
            }
            onKeyboardDecrementAction={() =>
                changeValueStepwise(value, range, -1, onChange)
            }
        />
    );
};

export default NumberInlineInput;
