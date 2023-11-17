/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';

import classNames from '../utils/classNames';

import styles from './Dropdown.module.scss';

export interface DropdownItem<T = string> {
    label: React.ReactNode;
    value: T;
}

export type DropdownProps<T> = {
    id?: string;
    label?: React.ReactNode;
    defaultButtonLabel?: string;
    items: DropdownItem<T>[];
    onSelect: (item: DropdownItem<T>) => void;
    disabled?: boolean;
    selectedItem: DropdownItem<T>;
    numItemsBeforeScroll?: number;
    className?: string;
};

export default <T,>({
    id,
    label,
    defaultButtonLabel = '',
    items,
    onSelect,
    disabled = false,
    selectedItem,
    numItemsBeforeScroll = 0,
    className = '',
}: DropdownProps<T>) => {
    const [isActive, setIsActive] = useState(false);

    const onClickItem = (item: DropdownItem<T>) => {
        onSelect(item);
        setIsActive(false);
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
            {label && (
                <FormLabel className="tw-mb-1 tw-text-xs">{label}</FormLabel>
            )}
            <button
                id={id}
                type="button"
                className="tw-flex tw-h-8 tw-w-full tw-items-center tw-justify-between tw-border-0 tw-bg-gray-700 tw-px-2 tw-text-white"
                onClick={() => setIsActive(!isActive)}
                disabled={disabled}
            >
                <span>
                    {items.findIndex(e => e.value === selectedItem.value) === -1
                        ? defaultButtonLabel
                        : selectedItem.label}
                </span>
                <span
                    className={`mdi mdi-chevron-down tw-text-lg ${classNames(
                        isActive && 'tw-rotate-180'
                    )}`}
                />
            </button>
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
                        key={JSON.stringify(item.value)}
                        onClick={() => onClickItem(item)}
                    >
                        {item.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
