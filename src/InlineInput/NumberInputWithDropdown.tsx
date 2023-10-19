/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import FormLabel from 'react-bootstrap/esm/FormLabel';

import { DropdownItem } from '../Dropdown/Dropdown';
import classNames from '../utils/classNames';
import NumberInlineInput from './NumberInlineInput';

import styles from '../Dropdown/Dropdown.module.scss';

export type NumberDropdownItem = DropdownItem<number>;

interface DropdownProps {
    id?: string;
    label?: React.ReactNode;
    items: NumberDropdownItem[];
    value: number;
    onChange: (value: number) => void;
    numItemsBeforeScroll?: number;
    className?: string;
    disabled?: boolean;
}

export default ({
    id,
    label,
    items,
    value,
    onChange,
    numItemsBeforeScroll = 0,
    className = '',
    disabled = false,
}: DropdownProps) => {
    const [isActive, setIsActive] = useState(false);
    const [inlineValue, setInlineValue] = useState(value);

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

    return (
        <div
            className={`tw-preflight tw-relative tw-w-full ${className}`}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsActive(false);
                }
            }}
        >
            <FormLabel className="tw-mb-1 tw-text-xs">{label}</FormLabel>
            <div className="tw-flex tw-h-8 tw-w-full">
                <NumberInlineInput
                    value={inlineValue}
                    range={{ min: 1, max: 1_000_000, step: 1, decimals: 0 }}
                    onChange={val => setInlineValue(val)}
                    onChangeComplete={val => setNewValue(val)}
                    className="tw-x-2 tw-h-full tw-w-full tw-bg-gray-700 tw-text-white tw-outline-white"
                    textAlignLeft
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
                            isActive && 'tw-rotate-180'
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
                className={`tw-text-while tw-absolute tw-right-0 tw-z-10 tw-w-full tw-border-t-2 tw-border-solid tw-border-gray-600 tw-bg-gray-700 tw-p-0 ${classNames(
                    styles.content,
                    !isActive && 'tw-hidden'
                )}`}
            >
                {items.map(item => (
                    <button
                        type="button"
                        className="tw-bg-transparent tw-clear-both tw-block tw-h-6 tw-w-full tw-whitespace-nowrap tw-border-0 tw-px-2 tw-py-1 tw-text-left tw-font-normal tw-text-white hover:tw-bg-gray-600 focus:tw-bg-gray-600"
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
