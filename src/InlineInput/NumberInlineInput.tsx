/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC } from 'react';
import { bool, func, number } from 'prop-types';

import rangeShape, { RangeProp } from '../Slider/rangeShape';
import InlineInput from './InlineInput';

import './number-inline-input.scss';

const isInRange = (value: number, { min, max, decimals = 0 }: RangeProp) =>
    value >= min && value <= max && value === Number(value.toFixed(decimals));

interface Props {
    disabled?: boolean;
    value: number;
    range: RangeProp;
    onChange: (number: number) => void;
    onChangeComplete?: (number: number) => void;
}

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
    />
);

NumberInlineInput.propTypes = {
    disabled: bool,
    value: number.isRequired,
    range: rangeShape.isRequired,
    onChange: func.isRequired,
    onChangeComplete: func,
};

export default NumberInlineInput;
