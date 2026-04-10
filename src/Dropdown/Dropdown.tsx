/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useId, useRef, useState } from 'react';

import Popover from '../Popover/Popover';
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
    disabled = false,
    selectedItem,
    className,
    size = 'md',
    ...attrs
}: DropdownProps<T>) => {
    const dropdownId = useId();
    const dropdownBtnId = `${dropdownId}-btn`;
    const dropdownPopoverId = `${dropdownId}-dropdown`;

    const dropdownPopoverRef = useRef<HTMLDialogElement>(null);

    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        // Manual popover control is mainly for the dropdown button
        // Otherwise the popover and the buttons in the dropdown manage
        // the popover's state through HTML `command` attribute
        if (isActive) {
            if (!dropdownPopoverRef.current?.open) {
                dropdownPopoverRef.current?.showPopover();
            }
        } else if (dropdownPopoverRef.current?.open) {
            dropdownPopoverRef.current?.hidePopover();
        }
    }, [isActive]);

    return (
        <div className={classNames('tw-preflight', className)} {...attrs}>
            {label && (
                <label className="tw-text-xs" htmlFor={dropdownBtnId}>
                    {label}
                </label>
            )}
            <button
                id={dropdownBtnId}
                type="button"
                className={classNames(
                    'tw-flex tw-min-w-12 tw-items-center tw-justify-between tw-border-0',
                    styles.anchor,
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
            <Popover
                ref={dropdownPopoverRef}
                closingBehavior="hint"
                id={dropdownPopoverId}
                className={classNames(
                    'tw-absolute tw-overflow-y-auto tw-border-2 tw-border-solid tw-border-gray-600 tw-bg-gray-700 tw-text-white [&:popover-open]:tw-flex [&:popover-open]:tw-flex-col',
                    styles.popover,
                )}
                onToggle={ev => {
                    switch (ev.newState) {
                        case 'open':
                            setIsActive(true);
                            break;
                        case 'closed':
                            setIsActive(false);
                            break;
                    }
                }}
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
                            'tw-h-6 tw-whitespace-nowrap tw-border-0 tw-bg-transparent tw-px-2 tw-py-1 tw-text-left tw-font-normal tw-text-white hover:tw-bg-gray-600 focus:tw-bg-gray-600',
                            size === 'sm' && 'tw-text-2xs',
                        )}
                        key={JSON.stringify(item.value)}
                        onClick={() => onSelect(item)}
                    >
                        {item.label}
                    </button>
                ))}
            </Popover>
        </div>
    );
};

export default Dropdown;
