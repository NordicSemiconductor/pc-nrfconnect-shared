/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import { nanoid } from '@reduxjs/toolkit';

import classNames from '../utils/classNames';

import styles from './Dropdown.module.scss';

export interface DropdownItem<T = string> {
    label: React.ReactNode;
    value: T;
}

type PickedDropdownProps = 'ref' | 'className';

export interface DropdownProps<T>
    extends Pick<React.ComponentPropsWithRef<'div'>, PickedDropdownProps> {
    label?: React.ReactNode;
    defaultButtonLabel?: string;
    items: DropdownItem<T>[];
    onSelect: (item: DropdownItem<T>) => void;
    transparentButtonBg?: boolean;
    minWidth?: boolean;
    disabled?: boolean;
    selectedItem: DropdownItem<T>;
    // numItemsBeforeScroll?: number;
    size?: 'sm' | 'md';
}

const Dropdown = <T,>({
    label,
    defaultButtonLabel = '',
    items,
    onSelect,
    transparentButtonBg = false,
    minWidth = false,
    disabled = false,
    selectedItem,
    // numItemsBeforeScroll = 0,
    className,
    size = 'md',
}: DropdownProps<T>) => {
    // TODO: Replace with useId() after upgrading to newer React >=18.0
    const dropdownId = nanoid();
    const dropdownBtnId = `${dropdownId}-btn`;
    const dropdownPopoverId = `${dropdownId}-dropdown`;

    const [isActive, setIsActive] = useState(false);

    const onClickItem = (item: DropdownItem<T>) => {
        onSelect(item);
        setIsActive(false);
    };

    return (
        <div
            className={classNames(
                'tw-preflight tw-relative tw-flex tw-flex-col tw-gap-1 tw-text-xs',
                !minWidth && 'tw-w-full',
                className,
            )}
            // onBlur={event => {
            //     if (!event.currentTarget.contains(event.relatedTarget)) {
            //         setIsActive(false);
            //     }
            // }}
        >
            {label && (
                <label className="tw-text-xs" htmlFor={dropdownBtnId}>
                    {label}
                </label>
            )}
            <button
                id={dropdownBtnId}
                type="button"
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line react/no-unknown-property
                command="show-popover"
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line react/no-unknown-property
                commandfor={dropdownPopoverId}
                className={classNames(
                    'tw-flex tw-items-center tw-justify-between tw-border-0',
                    styles.anchor,
                    !minWidth && 'tw-w-full',
                    transparentButtonBg
                        ? 'tw-bg-transparent'
                        : classNames(
                              'tw-bg-gray-700 tw-text-white',
                              size === 'sm' &&
                                  'tw-h-6 tw-pl-2 tw-pr-1 tw-text-2xs',
                              size === 'md' && 'tw-h-8 tw-px-2',
                          ),
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
                        size === 'sm' && 'tw-text-base',
                        size === 'md' && 'tw-text-lg/none',
                    )}`}
                />
            </button>
            <dialog
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line react/no-unknown-property
                popover="hint"
                id={dropdownPopoverId}
                // onMouseDown={ev => {
                //     // To prevent the dropdown from closing when users click on the scrollbar of the items
                //     ev.preventDefault();
                // }}
                // style={
                //     numItemsBeforeScroll > 0
                //         ? {
                //             maxHeight: `${numItemsBeforeScroll * 24}px`,
                //         }
                //         : {}
                // }
                // data-height={
                //     numItemsBeforeScroll > 0 &&
                //     items.length > numItemsBeforeScroll
                // }
                className={classNames(
                    'tw-fixed tw-overflow-y-scroll tw-border-x-2 tw-border-t-2 tw-border-solid tw-border-gray-600 tw-bg-gray-700 tw-p-0 tw-text-white',
                    styles.popover,
                    !minWidth && 'tw-right-0 tw-w-full',
                    !isActive && 'tw-hidden',
                )}
            >
                {items.map(item => (
                    <button
                        type="button"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        // eslint-disable-next-line react/no-unknown-property
                        command="hide-popover"
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        // eslint-disable-next-line react/no-unknown-property
                        commandfor={dropdownPopoverId}
                        className={classNames(
                            'tw-clear-both tw-block tw-h-6 tw-w-full tw-whitespace-nowrap tw-border-0 tw-bg-transparent tw-px-2 tw-py-1 tw-text-left tw-font-normal tw-text-white hover:tw-bg-gray-600 focus:tw-bg-gray-600',
                            size === 'sm' && 'tw-text-2xs',
                        )}
                        key={JSON.stringify(item.value)}
                        onClick={() => onClickItem(item)}
                    >
                        {item.label}
                    </button>
                ))}
            </dialog>
        </div>
    );
};

export default Dropdown;
