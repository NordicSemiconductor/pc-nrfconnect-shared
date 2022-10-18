/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useResizeDetector } from 'react-resize-detector';
import { arrayOf, bool, func, number, string } from 'prop-types';

import classNames from '../utils/classNames';
import Bar from './Bar';
import Handle from './Handle';
import { toPercentage } from './percentage';
import rangeShape, { RangeProp } from './rangeShape';
import Ticks from './Ticks';

import './slider.scss';

interface Props {
    id?: string;
    title?: string;
    disabled?: boolean;
    values: number[];
    range: RangeProp;
    ticks?: boolean;
    onChange: ((v: number) => void)[];
    onChangeComplete?: () => void;
}

export const isFactor = (dividend: number, divisor: number): boolean => {
    let exp = 0;
    while (divisor !== Number(divisor.toFixed(0))) {
        exp++,
        divisor *= 10;
    }

    divisor = Number(divisor.toFixed(0));
    dividend =  Number((dividend * (10 ** exp)).toFixed(0));

    return dividend % divisor === 0;
}

const Slider: FC<Props> = ({
    id,
    title,
    disabled = false,
    values,
    range,
    ticks,
    onChange,
    onChangeComplete,
}) => {
    if (values.length === 0)
        console.error('"values" must contain at least on element');
    if (values.length !== onChange.length)
        console.error(
            `Props 'values' and 'onChange' must have the same size but were ${values} and ${onChange}`
        );
    if (range.min > range.max)
        console.error(
            `range.min must not be higher than range.max: ${JSON.stringify(
                range
            )}`
        );
    if (range.step && typeof range.step !== 'undefined') {
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

    const { width, ref } = useResizeDetector();

    const valueRange = {
        min: values.length === 1 ? range.min : Math.min(...values),
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
                start={toPercentage(valueRange.min, range)}
                end={toPercentage(valueRange.max, range)}
            />
            {ticks && <Ticks valueRange={valueRange} range={range} />}
            {values.map((value, index) => (
                <Handle
                    key={index} // eslint-disable-line react/no-array-index-key
                    value={value}
                    range={range}
                    disabled={disabled}
                    onChange={onChange[index]}
                    onChangeComplete={onChangeComplete}
                    sliderWidth={width}
                />
            ))}
        </div>
    );
};

Slider.propTypes = {
    id: string,
    title: string,
    disabled: bool,
    values: arrayOf(number.isRequired).isRequired,
    range: rangeShape.isRequired,
    ticks: bool,
    onChange: arrayOf(func.isRequired).isRequired,
    onChangeComplete: func,
};

export default Slider;
