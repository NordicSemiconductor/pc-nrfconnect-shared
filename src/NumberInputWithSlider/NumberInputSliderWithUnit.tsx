/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';

import NumberInlineInput from '../InlineInput/NumberInlineInput';
import { RangeOrValues } from '../Slider/range';
import Slider from '../Slider/Slider';

export default ({
    disabled,
    range,
    initialValue,
    onChangeComplete,
    label,
    unit,
}: {
    disabled: boolean;
    range: RangeOrValues;
    initialValue: number;
    onChangeComplete: (value: number) => void;
    label?: React.ReactNode;
    unit?: React.ReactNode;
}) => {
    const [internalValue, setInternalValue] = useState(initialValue);

    return (
        <div className="tw-flex tw-flex-col tw-gap-1">
            {label && (
                <div className="tw-flex tw-justify-between">
                    {label}
                    <div className="tw-flex tw-flex-row">
                        <NumberInlineInput
                            value={internalValue}
                            range={range}
                            onChange={value => setInternalValue(value)}
                            onChangeComplete={() =>
                                onChangeComplete(internalValue)
                            }
                            disabled={disabled}
                        />
                        {unit}
                    </div>
                </div>
            )}
            {Array.isArray(range) ? (
                <Slider
                    values={[range.indexOf(internalValue)]}
                    onChange={[i => setInternalValue(range[i])]}
                    onChangeComplete={() => onChangeComplete(internalValue)}
                    range={{
                        min: 0,
                        max: range.length - 1,
                    }}
                    disabled={disabled}
                />
            ) : (
                <Slider
                    values={[internalValue]}
                    onChange={[i => setInternalValue(i)]}
                    onChangeComplete={() => onChangeComplete(internalValue)}
                    range={range}
                    disabled={disabled}
                />
            )}
        </div>
    );
};
