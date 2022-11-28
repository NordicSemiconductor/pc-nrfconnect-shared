/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { useResizeDetector } from 'react-resize-detector';

import classNames from '../utils/classNames';
import Bar from './Bar';
import { isFactor } from './factor';
import Handle from './Handle';
import { toPercentage } from './percentage';
import { RangeProp } from './rangeShape';
import Ticks from './Ticks';

import './slider.scss';

export interface Props {
    id?: string;
    title?: string;
    disabled?: boolean;
    values: readonly number[];
    range: RangeProp;
    ticks?: boolean;
    onChange: ((v: number) => void)[];
    onChangeComplete?: () => void;
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
    const rangeNoOptional = {
        ...range,
        decimals: range.decimals ?? 0,
        step: range.step ?? 0,
    };

    if (values.length === 0)
        console.error('"values" must contain at least on element');
    if (values.length !== onChange.length)
        console.error(
            `Props 'values' and 'onChange' must have the same size but were ${values} and ${onChange}`
        );
    if (rangeNoOptional.min > rangeNoOptional.max)
        console.error(
            `range.min must not be higher than range.max: ${JSON.stringify(
                range
            )}`
        );
    if (rangeNoOptional.step > 0) {
        if (!isFactor(range.min, rangeNoOptional.step))
            console.error(
                `range.step must be a factor of range.min: ${JSON.stringify(
                    range
                )}`
            );
        if (!isFactor(range.max, rangeNoOptional.step))
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
                start={toPercentage(valueRange.min, rangeNoOptional)}
                end={toPercentage(valueRange.max, rangeNoOptional)}
            />
            {ticks && <Ticks valueRange={valueRange} range={rangeNoOptional} />}
            {values.map((value, index) => (
                <Handle
                    key={index} // eslint-disable-line react/no-array-index-key
                    value={value}
                    range={rangeNoOptional}
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
