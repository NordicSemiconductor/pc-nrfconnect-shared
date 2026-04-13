/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';

import Popover from '../Popover/Popover';
import classNames from '../utils/classNames';
import { signedRatio } from '../utils/signedRatio';

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

interface DropdownComponent {
    <T>(props: DropdownProps<T>): ReturnType<React.FC>;
}

const Dropdown: DropdownComponent = ({
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
}) => {
    const dropdownId = useId();
    const dropdownBtnId = `${dropdownId}-btn`;
    const dropdownPopoverId = `${dropdownId}-dropdown`;

    const dropdownBtnRef = useRef<HTMLButtonElement>(null);
    const dropdownPopoverRef = useRef<HTMLDialogElement>(null);

    const intersectionObs = useRef<IntersectionObserver>(null);

    // Prefer placing the dropdown at the bottom even if there's up to <rate> percent more space at the top
    // 0.0 = Only prefer amount of available space
    // 0.25 = Prefer bottom placement even if there's up to 25% more space available at the top
    const bottomPreferenceRate = 0.1;

    const onIntersect: (entries: Array<IntersectionObserverEntry>) => void =
        useCallback(
            ([observed]) => {
                if (
                    !observed ||
                    !observed.rootBounds ||
                    !dropdownBtnRef.current
                ) {
                    return;
                }

                const dropdownBtnRect =
                    dropdownBtnRef.current.getBoundingClientRect();

                const distanceToViewportTop =
                    dropdownBtnRect.top - observed.rootBounds.top;
                const distanceToViewportBottom =
                    observed.rootBounds.bottom - dropdownBtnRect.bottom;

                if (distanceToViewportTop <= 0) {
                    // Place dropdown at bottom
                }

                if (distanceToViewportBottom <= 0) {
                    // Place dropdown at top
                }

                const topBottomSignedRatio = signedRatio(
                    distanceToViewportTop,
                    distanceToViewportBottom,
                );

                if (topBottomSignedRatio > bottomPreferenceRate) {
                    // Place dropdown at top
                } else {
                    // Place dropdown at bottom
                }
            },
            [dropdownBtnRef],
        );

    // Create `IntersectionObserver` at mount only
    useEffect(() => {
        intersectionObs.current = new IntersectionObserver(onIntersect);
    }, [onIntersect]);

    // Start/Stop observing dropdown menu
    useEffect(() => {
        // See https://stackoverflow.com/questions/67069827/cleanup-ref-issues-in-react
        let observed = null;

        if (dropdownPopoverRef.current && intersectionObs.current) {
            observed = dropdownPopoverRef.current;
            intersectionObs.current?.observe(observed);
        }

        return () => {
            // if (observed && intersectionObs.current) {
            //     intersectionObs.current.unobserve(observed);
            // }
        };
    }, [intersectionObs, dropdownPopoverRef]);

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
                ref={dropdownBtnRef}
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
                    styles.anchoredPopover,
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
