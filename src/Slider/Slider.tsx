/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import classNames from '../utils/classNames';
import Bar from './Bar';
import { isFactor } from './factor';
import Handle from './Handle';
import { toPercentage } from './percentage';
import { getMin, isValues, Range, RangeOrValues, Values } from './range';
import Ticks from './Ticks';

import './slider.scss';

const useValidatedArraySizes = (
    values: readonly number[],
    onChange: ((v: number) => void)[]
) => {
    useEffect(() => {
        if (values.length === 0)
            console.error('"values" must contain at least on element');
        if (values.length !== onChange.length)
            console.error(
                `Props 'values' and 'onChange' must have the same size but were ${values} and ${onChange}`
            );
    }, [onChange, values]);
};

const validateValues = (values: Values) => {
    for (let i = 0; i < values.length - 1; i += 1) {
        if (values[i] > values[i + 1]) {
            console.error(
                `The values of the range must be sorted correctly, but ${
                    values[i]
                } is larger then ${values[i + 1]} in ${values}`
            );
        }
    }
};

const validateRange = (range: Range) => {
    if (range.min > range.max)
        console.error(
            `range.min must not be higher than range.max: ${JSON.stringify(
                range
            )}`
        );

    if (range.step != null) {
        if (!isFactor(range.min, range.step))
            console.error(
                `range.step must be a factor of range.min: ${JSON.stringify(
                    range
                )}`
            );
        if (!isFactor(range.max, range.step))
            console.error(
                `range.step must be a factor of range.max: ${JSON.stringify(
                    range
                )}`
            );
    }
};

const useValidatedRangeOrValues = (rangeOrValues: RangeOrValues) => {
    useEffect(() => {
        if (isValues(rangeOrValues)) {
            validateValues(rangeOrValues);
        } else {
            validateRange(rangeOrValues);
        }
    }, [rangeOrValues]);
};

export interface Props {
    id?: string;
    title?: string;
    disabled?: boolean;
    values: readonly number[];
    range: RangeOrValues;
    ticks?: boolean;
    onChange: ((v: number) => void)[];
    onChangeComplete?: () => void;
}

const Slider: FC<Props> = ({
    id,
    title,
    disabled = false,
    values,
    range: rangeOrValues,
    ticks,
    onChange,
    onChangeComplete,
}) => {
    useValidatedArraySizes(values, onChange);
    useValidatedRangeOrValues(rangeOrValues);

    const { width, ref } = useResizeDetector();

    const valueRange = {
        min: values.length === 1 ? getMin(rangeOrValues) : Math.min(...values),
        max: Math.max(...values),
    };

    return (
        <div
            className={classNames('slider', disabled && 'disabled')}
            id={id}
            title={title}
            ref={ref as React.MutableRefObject<HTMLDivElement>}
        >
            <Bar
                start={toPercentage(valueRange.min, rangeOrValues)}
                end={toPercentage(valueRange.max, rangeOrValues)}
            />
            {ticks && <Ticks valueRange={valueRange} range={rangeOrValues} />}
            {values.map((value, index) => (
                <Handle
                    key={index} // eslint-disable-line react/no-array-index-key
                    value={value}
                    range={rangeOrValues}
                    disabled={disabled}
                    onChange={onChange[index]}
                    onChangeComplete={onChangeComplete}
                    sliderWidth={width}
                />
            ))}
        </div>
    );
};

export default Slider;
