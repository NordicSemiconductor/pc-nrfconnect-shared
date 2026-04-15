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

type DropdownPosition = 'bottom' | 'top';

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

    const [dropdownPos, setDropdownPos] = useState<DropdownPosition>('bottom');
    const [dropdownMaxHeight, setDropdownMaxHeight] = useState<number>(100);

    const [isActive, setIsActive] = useState(false);

    const onChange = useCallback(() => {
        if (
            !dropdownBtnRef.current ||
            !dropdownPopoverRef.current?.checkVisibility()
        ) {
            return;
        }

        const dropdownBtnRect = dropdownBtnRef.current.getBoundingClientRect();

        const rootRect = new DOMRect(
            window.scrollX,
            window.scrollY,
            document.documentElement.clientWidth,
            document.documentElement.clientHeight,
        );

        const distanceToViewportTop = Math.trunc(
            dropdownBtnRect.top - rootRect.top,
        );
        const distanceToViewportBottom = Math.trunc(
            rootRect.bottom - dropdownBtnRect.bottom,
        );

        const placeDropdownAtTop = () => {
            setDropdownPos('top');
            setDropdownMaxHeight(distanceToViewportTop);
        };
        const placeDropdownAtBottom = () => {
            setDropdownPos('bottom');
            setDropdownMaxHeight(distanceToViewportBottom);
        };

        // Early returns
        if (distanceToViewportTop <= 0) {
            placeDropdownAtBottom();
            return;
        }

        if (distanceToViewportBottom <= 0) {
            placeDropdownAtTop();
            return;
        }

        const dropdownPopoverComputedStyleValues = window.getComputedStyle(
            dropdownPopoverRef.current,
        );

        // Since our dropdown can be scrollable, here we want to know its
        // full height of border box, not just the height of what's visible.
        // ACK: Used CSS values are strings ending in `px` for lengths and we
        // pass it directly to `parseFloat`, that's because `parseFloat`
        // will ignore any "unparseable" characters after the parseable number.
        // This is not very elegant, but there's no method to cleanly retrieve
        // the border box of an element, including its overflow ("scroll height")
        const dropdownPopoverHeight = Math.trunc(
            dropdownPopoverRef.current.scrollHeight +
                parseFloat(dropdownPopoverComputedStyleValues.borderTop) +
                parseFloat(dropdownPopoverComputedStyleValues.borderBottom),
        );

        // Enough space to fit the dropdown without scroll
        if (distanceToViewportBottom >= dropdownPopoverHeight) {
            placeDropdownAtBottom();
            return;
        }

        if (distanceToViewportTop >= dropdownPopoverHeight) {
            placeDropdownAtTop();
            return;
        }

        // Thereafter, neither top nor bottom has enough space to fit the dropdown,
        // so we instead refer to an arbitrary 15% preference of bottom placement
        // over top placement
        const bottomPreference = 0.15;
        const topBottomRatio =
            Math.trunc(
                20 *
                    signedRatio(
                        distanceToViewportTop,
                        distanceToViewportBottom,
                    ),
            ) / 20; // Smoothes out floating point errors (step = 0.05)

        if (topBottomRatio <= bottomPreference) {
            placeDropdownAtBottom();
        } else {
            placeDropdownAtTop();
        }
    }, [dropdownPopoverRef]);

    useEffect(() => {
        switch (dropdownPos) {
            case 'bottom':
                dropdownPopoverRef.current?.classList.remove(
                    styles.anchorToTop,
                );
                dropdownPopoverRef.current?.classList.add(
                    styles.anchorToBottom,
                );
                break;
            case 'top':
                dropdownPopoverRef.current?.classList.remove(
                    styles.anchorToBottom,
                );
                dropdownPopoverRef.current?.classList.add(styles.anchorToTop);
                break;
        }
    }, [dropdownPos, dropdownPopoverRef]);

    useEffect(() => {
        // This prevents the dropdown from overflowing past the viewport,
        // allowing the user to scroll the list.
        // The list will become visible if window scrolling makes the entire
        // list visible.
        dropdownPopoverRef.current?.style.setProperty(
            'max-height',
            `${dropdownMaxHeight}px`,
        );
    }, [dropdownMaxHeight, dropdownPopoverRef]);

    // Setup/Cleanup scroll observer and window resizing observer
    useEffect(() => {
        intersectionObs.current = new IntersectionObserver(() => {
            onChange();
        });

        const resizeEventHandler = () => {
            onChange();
        };

        window.addEventListener('resize', resizeEventHandler);

        return () => {
            intersectionObs.current = null;
            window.removeEventListener('resize', resizeEventHandler);
        };
    }, [onChange]);

    // Start/Stop observing dropdown for scroll
    useEffect(() => {
        // See https://stackoverflow.com/questions/67069827/cleanup-ref-issues-in-react
        let observed = null;

        if (dropdownBtnRef.current && intersectionObs.current) {
            observed = dropdownBtnRef.current;
            intersectionObs.current?.observe(observed);
        }

        return () => {
            if (observed && intersectionObs.current) {
                intersectionObs.current.unobserve(observed);
            }
        };
    }, [intersectionObs, dropdownBtnRef]);

    // Watch for property changes that may affect the dropdown's height (items)
    useEffect(() => {
        onChange();
    }, [items, onChange]);

    useEffect(() => {
        // Manual popover control is mainly for the dropdown button
        // Otherwise the popover and the buttons in the dropdown manage
        // the popover's state through HTML `command` attribute
        if (isActive) {
            if (!dropdownPopoverRef.current?.open) {
                dropdownPopoverRef.current?.showPopover();
                onChange();
            }
        } else if (dropdownPopoverRef.current?.open) {
            dropdownPopoverRef.current?.hidePopover();
        }
    }, [isActive, onChange]);

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
                    'tw-absolute tw-m-0 tw-overflow-y-auto tw-border-2 tw-border-solid tw-border-gray-600 tw-bg-gray-700 tw-text-white [&:popover-open]:tw-flex [&:popover-open]:tw-flex-col',
                    styles.anchoredPopover,
                    dropdownPos === 'bottom' && 'tw-bottom-auto',
                    dropdownPos === 'top' && 'tw-top-auto',
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
