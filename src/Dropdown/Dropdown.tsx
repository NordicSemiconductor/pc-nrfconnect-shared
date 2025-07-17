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
    transparentButtonBg?: boolean;
    minWidth?: boolean;
    disabled?: boolean;
    selectedItem: DropdownItem<T>;
    numItemsBeforeScroll?: number;
    className?: string;
    size?: 'sm' | 'md';
};

export default <T,>({
    id,
    label,
    defaultButtonLabel = '',
    items,
    onSelect,
    transparentButtonBg = false,
    minWidth = false,
    disabled = false,
    selectedItem,
    numItemsBeforeScroll = 0,
    className = '',
    size = 'md',
}: DropdownProps<T>) => {
    const [isActive, setIsActive] = useState(false);

    const onClickItem = (item: DropdownItem<T>) => {
        onSelect(item);
        setIsActive(false);
    };

    return (
        <div
            className={classNames(
                'tw-preflight tw-relative tw-text-xs',
                minWidth ? '' : 'tw-w-full',
                className
            )}
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
                className={classNames(
                    'tw-flex tw-items-center tw-justify-between tw-border-0',
                    minWidth ? '' : 'tw-w-full',
                    transparentButtonBg
                        ? 'tw-bg-transparent'
                        : classNames(
                              'tw-bg-gray-700 tw-text-white',
                              size === 'sm'
                                  ? 'tw-h-6 tw-pl-2 tw-pr-1 tw-text-2xs'
                                  : 'tw-h-8 tw-px-2'
                          )
                )}
                onClick={() => setIsActive(!isActive)}
                disabled={disabled}
            >
                <span className="tw-overflow-hidden tw-text-ellipsis tw-whitespace-nowrap">
                    {items.findIndex(e => e.value === selectedItem.value) === -1
                        ? defaultButtonLabel
                        : selectedItem.label}
                </span>
                <span
                    className={`mdi mdi-chevron-down ${classNames(
                        isActive && 'tw-rotate-180',
                        size === 'sm' ? 'tw-text-base' : 'tw-text-lg'
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
                className={`tw-text-while tw-absolute tw-z-10 tw-border-t-2 tw-border-solid tw-border-gray-600 tw-bg-gray-700 tw-p-0 ${classNames(
                    styles.content,
                    minWidth ? '' : 'tw-right-0 tw-w-full',
                    !isActive && 'tw-hidden'
                )}`}
            >
                {items.map(item => (
                    <button
                        type="button"
                        className={classNames(
                            'tw-bg-transparent tw-clear-both tw-block tw-h-6 tw-w-full tw-whitespace-nowrap tw-border-0 tw-px-2 tw-py-1 tw-text-left tw-font-normal tw-text-white hover:tw-bg-gray-600 focus:tw-bg-gray-600',
                            size === 'sm' && 'tw-text-2xs'
                        )}
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
