/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import Dropdown, { type DropdownItem } from '../Dropdown/Dropdown';
import NumberInlineInput from '../InlineInput/NumberInlineInput';
import { RangeOrValues } from '../Slider/range';
import BaseSlider from '../Slider/Slider';
import classNames from '../utils/classNames';

const Slider = ({
    range,
    value,
    onChange,
    onChangeComplete,
    disabled,
}: {
    range: RangeOrValues;
    value: number;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    disabled?: boolean;
}) =>
    Array.isArray(range) ? (
        <BaseSlider
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
        <BaseSlider
            values={[value]}
            onChange={[onChange]}
            onChangeComplete={() => onChangeComplete?.(value)}
            range={range}
            disabled={disabled}
        />
    );

interface DropdownUnit<T> {
    selectedItem: DropdownItem<T>;
    items: DropdownItem<T>[];
    onUnitChange: (unit: DropdownItem<T>) => void;
}

const isDropdownUnit = <T,>(
    unit: React.ReactNode | DropdownUnit<T>
): unit is DropdownUnit<T> =>
    unit != null &&
    Object.keys(unit).includes('selectedItem') &&
    Object.keys(unit).includes('items') &&
    Object.keys(unit).includes('onUnitChange');

export default <T,>({
    range,
    value,
    onChange,
    onChangeComplete,
    className,
    disabled,
    label,
    title,
    unit,
    showSlider = false,
    minWidth = false,
    inputMinSize,
    preAllocateInputSize,
}: {
    range: RangeOrValues;
    value: number;
    onChange: (value: number) => void;
    onChangeComplete?: (value: number) => void;
    className?: string;
    disabled?: boolean;
    label: React.ReactNode;
    title?: string;
    showSlider?: boolean;
    unit?: React.ReactNode | DropdownUnit<T>;
    minWidth?: boolean;
    inputMinSize?: number;
    preAllocateInputSize?: boolean;
}) => (
    <div
        className={`tw-flex tw-flex-col tw-gap-1 tw-text-xs ${classNames(
            className
        )}`}
    >
        <div
            className={classNames(
                'tw-flex tw-flex-row',
                minWidth ? '' : 'tw-justify-between'
            )}
            title={title}
        >
            {label}
            <div className="tw-flex tw-flex-row tw-items-center">
                <NumberInlineInput
                    value={value}
                    range={range}
                    onChange={onChange}
                    onChangeComplete={onChangeComplete}
                    disabled={disabled}
                    minSize={inputMinSize}
                    preAllocateSize={preAllocateInputSize}
                />
                {isDropdownUnit(unit) ? (
                    <Dropdown
                        items={unit.items}
                        selectedItem={unit.selectedItem}
                        transparentButtonBg
                        minWidth
                        onSelect={unit.onUnitChange}
                        disabled={disabled}
                    />
                ) : (
                    unit
                )}
            </div>
        </div>

        {showSlider && (
            <Slider
                range={range}
                value={value}
                onChange={onChange}
                onChangeComplete={onChangeComplete}
                disabled={disabled}
            />
        )}
    </div>
);
