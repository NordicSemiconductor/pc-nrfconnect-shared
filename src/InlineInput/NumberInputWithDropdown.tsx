/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';

import { type DropdownItem } from '../Dropdown/Dropdown';
import { type RangeOrValues } from '../Slider/range';
import classNames from '../utils/classNames';
import { useSynchronisationIfChangedFromOutside } from './InlineInput';
import NumberInlineInput from './NumberInlineInput';

import styles from '../Dropdown/Dropdown.module.scss';

export type NumberDropdownItem = DropdownItem<number>;

interface DropdownProps {
    id?: string;
    label?: React.ReactNode;
    items: NumberDropdownItem[];
    value: number;
    onChange: (value: number) => void;
    range: RangeOrValues;
    numItemsBeforeScroll?: number;
    className?: string;
    disabled?: boolean;
    title?: string;
}

export default ({
    id,
    label,
    items,
    value,
    onChange,
    range,
    numItemsBeforeScroll = 0,
    className = '',
    disabled = false,
    title,
}: DropdownProps) => {
    const [isActive, setIsActive] = useState(false);
    const [inlineValue, setInlineValue] = useState(value);
    const [isValid, setIsValid] = useState(true);

    const setNewValue = (newValue: number) => {
        setInlineValue(newValue);
        onChange(newValue);
        setIsActive(false);
    };
    const onClickItem = (item: NumberDropdownItem) => {
        if (item.value != null && typeof item.value === 'number') {
            setNewValue(item.value);
        }
    };

    useSynchronisationIfChangedFromOutside(value, setInlineValue);

    return (
        <div
            className={`tw-preflight tw-relative tw-w-full ${className}`}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsActive(false);
                }
            }}
            title={title}
        >
            <div className="tw-mb-1 tw-text-xs">{label}</div>
            <div className="tw-flex tw-h-8 tw-w-full">
                <NumberInlineInput
                    value={inlineValue}
                    range={range}
                    onChange={val => setInlineValue(val)}
                    onChangeComplete={val => setNewValue(val)}
                    className={`tw-x-2 tw-h-full tw-w-full tw-bg-gray-700 tw-text-white tw-underline tw-underline-offset-2 ${
                        isValid ? 'tw-decoration-white' : 'tw-decoration-red'
                    }`}
                    textAlignLeft
                    onValidityChanged={setIsValid}
                    preventDefaultInvalidStyle
                    disabled={disabled}
                />
                <button
                    id={id}
                    type="button"
                    className="tw-overflow-hidden tw-border-b tw-border-solid tw-border-b-gray-200 tw-bg-gray-700 tw-px-2 tw-text-white"
                    onClick={() => setIsActive(!isActive)}
                    disabled={disabled}
                >
                    <span
                        className={`mdi mdi-chevron-down tw-text-lg ${classNames(
                            isActive && 'tw-rotate-180',
                        )}`}
                    />
                </button>
            </div>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions -- We need an interactive handler as described below */}
            <div
                onMouseDown={ev => {
                    // To prevent the dropdown from closing when users click on the scrollbar of the items
                    ev.preventDefault();
                }}
                style={
                    numItemsBeforeScroll > 0
                        ? {
                              maxHeight: `${numItemsBeforeScroll * 24}px`,
                          }
                        : {}
                }
                data-height={
                    numItemsBeforeScroll > 0 &&
                    items.length > numItemsBeforeScroll
                }
                className={`tw-text-while tw-absolute tw-right-0 tw-z-10 tw-w-full tw-bg-gray-700 tw-p-0 ${classNames(
                    styles.content,
                    !isActive && 'tw-hidden',
                )}`}
            >
                {items.map(item => (
                    <button
                        type="button"
                        className="tw-clear-both tw-block tw-h-6 tw-w-full tw-whitespace-nowrap tw-border-0 tw-bg-transparent tw-px-2 tw-py-1 tw-text-left tw-font-normal tw-text-white hover:tw-bg-gray-600 focus:tw-bg-gray-600"
                        key={item.value}
                        onClick={() => onClickItem(item)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
