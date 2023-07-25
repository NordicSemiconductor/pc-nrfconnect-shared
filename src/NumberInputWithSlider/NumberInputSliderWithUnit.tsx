/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import NumberInlineInput from '../InlineInput/NumberInlineInput';
import { RangeOrValues } from '../Slider/range';
import Slider from '../Slider/Slider';

export default ({
    range,
    value,
    onChange,
    onChangeComplete,
    disabled,
    label,
    unit,
}: {
    range: RangeOrValues;
    value: number;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    disabled?: boolean;
    label?: React.ReactNode;
    unit?: React.ReactNode;
}) => (
    <div className="tw-flex tw-flex-col tw-gap-1">
        {label && (
            <div className="tw-flex tw-justify-between">
                {label}
                <div className="tw-flex tw-flex-row">
                    <NumberInlineInput
                        value={value}
                        range={range}
                        onChange={onChange}
                        onChangeComplete={onChangeComplete}
                        disabled={disabled}
                    />
                    {unit}
                </div>
            </div>
        )}
        {Array.isArray(range) ? (
            <Slider
                values={[range.indexOf(value)]}
                onChange={[i => onChange(range[i])]}
                onChangeComplete={() => onChangeComplete?.(value)}
                range={{
                    min: 0,
                    max: range.length - 1,
                }}
                disabled={disabled}
            />
        ) : (
            <Slider
                values={[value]}
                onChange={[onChange]}
                onChangeComplete={() => onChangeComplete?.(value)}
                range={range}
                disabled={disabled}
            />
        )}
    </div>
);
