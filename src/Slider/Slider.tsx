/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, useEffect } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import classNames from '../utils/classNames';
import Bar from './Bar';
import Handle from './Handle';
import { toPercentage } from './percentage';
import { getMin, RangeOrValues, useValidatedRangeOrValues } from './range';
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

const warnAboutUndefinedCallback = (index: number) => () => {
    throw new Error(`onChange is not defined for index ${index}`);
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
                    onChange={
                        onChange[index] ?? warnAboutUndefinedCallback(index)
                    }
                    onChangeComplete={onChangeComplete}
                    sliderWidth={width}
                />
            ))}
        </div>
    );
};

export default Slider;
