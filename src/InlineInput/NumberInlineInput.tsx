/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import { isFactor } from '../Slider/factor';
import {
    getStep,
    isValues,
    Range,
    RangeOrValues,
    useValidatedRange,
    Values,
} from '../Slider/range';
import InlineInput from './InlineInput';

import './number-inline-input.scss';

interface NumberInlineInput {
    disabled?: boolean;
    value: number;
    range: RangeOrValues;
    className?: string;
    title?: string;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    textAlignLeft?: boolean;
    onValidityChanged?: (validity: boolean) => void;
    preventDefaultInvalidStyle?: boolean;
    minSize?: number;
    preAllocateSize?: boolean;
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
    steps: number
) => {
    const nextValue = isValues(rangeOrValues)
        ? nextInValues(current, rangeOrValues, steps)
        : nextInRange(current, rangeOrValues, steps);

    if (nextValue != null) {
        return nextValue;
    }

    return nextValue != null ? nextValue : current;
};

const handleInfinityToString = (val: number) =>
    Math.abs(val) === Infinity ? `${val < 0 ? '-' : ''}∞` : String(val);

const handleInfinityToNumber = (val: string) => {
    if (val === '∞') {
        return Infinity;
    }
    if (val === '-∞') {
        return -Infinity;
    }
    return Number(val);
};

const calculateMaxCharactersFromRange = (range: RangeOrValues): number => {
    if (isValues(range)) {
        return Math.max(
            ...range.map(v =>
                Number.isFinite(v)
                    ? handleInfinityToString(v).length
                    : v.toString().length
            )
        );
    }

    const { min, max, decimals = 0 } = range;
    const minStr = Number.isFinite(min)
        ? min.toFixed(decimals)
        : handleInfinityToString(min);
    const maxStr = Number.isFinite(max)
        ? max.toFixed(decimals)
        : handleInfinityToString(max);

    return Math.max(minStr.length, maxStr.length);
};

export default ({
    disabled,
    value,
    range,
    className,
    title,
    onChange,
    onChangeComplete = () => {},
    textAlignLeft,
    onValidityChanged,
    preventDefaultInvalidStyle,
    minSize,
    preAllocateSize = true,
}: NumberInlineInput) => {
    useValidatedRange(range);

    return (
        <InlineInput
            className={`${className} number-inline-input`}
            title={title}
            disabled={disabled}
            value={handleInfinityToString(value)}
            onChange={newValue => onChange(handleInfinityToNumber(newValue))}
            onChangeComplete={newValue =>
                onChangeComplete(handleInfinityToNumber(newValue))
            }
            onKeyboardIncrementAction={() =>
                handleInfinityToString(
                    changeValueStepwise(value, range, 1)
                ).toString()
            }
            onKeyboardDecrementAction={() =>
                handleInfinityToString(
                    changeValueStepwise(value, range, -1)
                ).toString()
            }
            textAlignLeft={textAlignLeft}
            isValid={newValue => {
                const validity = isValid(
                    handleInfinityToNumber(newValue),
                    range
                );
                if (onValidityChanged != null) {
                    // Then propagate the validity back to parent
                    onValidityChanged(validity);
                }
                return validity;
            }}
            onValidityChanged={onValidityChanged}
            preventDefaultInvalidStyle={preventDefaultInvalidStyle}
            minSize={
                preAllocateSize
                    ? minSize ??
                      Math.max(
                          ...(isValues(range)
                              ? range.map(v =>
                                    Number.isFinite(v)
                                        ? handleInfinityToString(v)
                                        : v.toString()
                                )
                              : [range.min, range.max].map(v =>
                                    Number.isFinite(v)
                                        ? v.toFixed(range.decimals)
                                        : handleInfinityToString(v)
                                )
                          ).map(v => v.length)
                      )
                    : undefined
            }
            maxLength={calculateMaxCharactersFromRange(range)}
        />
    );
};
