/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';

import classNames from '../utils/classNames';
import {
    getPersistedGroupCollapseState,
    persistGroupCollapseState,
} from '../utils/persistentStore';

const collapseSection = (element: HTMLDivElement) => {
    const sectionHeight = element.scrollHeight;
    element.style.overflow = 'hidden';

    element.addEventListener(
        'transitionstart',
        () => {
            element.setAttribute('data-animating', 'true');
            element.style.pointerEvents = 'none';
        },
        { once: true }
    );

    // on the next frame (as soon as the previous style change has taken effect),
    // explicitly set the element's height to its current pixel height, so we
    // aren't transitioning out of 'auto'
    requestAnimationFrame(() => {
        element.style.height = `${sectionHeight}px`;

        // on the next frame (as soon as the previous style change has taken effect),
        // have the element transition to height: 0
        requestAnimationFrame(() => {
            element.style.height = `${0}px`;
            element.addEventListener(
                'transitionend',
                () => {
                    element.style.pointerEvents = '';
                    element.setAttribute('data-animating', 'false');
                },
                { once: true }
            );
        });
    });
};

const expandSection = (element: HTMLDivElement) => {
    const sectionHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    if (sectionHeight === clientHeight) return;

    element.style.height = `${sectionHeight}px`;

    element.addEventListener(
        'transitionstart',
        () => {
            element.style.pointerEvents = 'none';
            element.setAttribute('data-animating', 'true');
        },
        { once: true }
    );
    element.addEventListener(
        'transitionend',
        () => {
            element.style.height = '';
            element.style.pointerEvents = '';
            element.style.overflow = '';
            element.setAttribute('data-animating', 'false');
        },
        { once: true }
    );
};

/**
 * @remarks
 * To enable state persistence, you must provide both `persistCollapseState={true}` and a unique `id`.
 * The collapse state will be saved to local storage and restored on subsequent renders.
 *
 * @returns {React.JSX.Element} A React functional component
 */
export const Group = ({
    className = '',
    heading,
    title,
    children,
    gap = 2,
    headingFullWidth = true,
    collapsible = false,
    defaultCollapsed = !!collapsible,
    onToggled,
    persistCollapseState = false,
    id = '',
}: {
    className?: string;
    heading: React.ReactNode;
    headingFullWidth?: boolean;
    title?: string;
    children?: React.ReactNode;
    gap?: 0.5 | 1 | 2 | 4 | 8;
    collapsible?: boolean;
    defaultCollapsed?: boolean;
    onToggled?: (isNowExpanded: boolean) => void;
    /** Whether to persist the collapse state across sessions. **Requires `id` to be provided.** */
    persistCollapseState?: boolean;
    /** Unique identifier for the group. **Required when `persistCollapseState` is true.** */
    id?: string;
}) => {
    const getInitialCollapseState = () => {
        if (persistCollapseState && id) {
            const persistedState = getPersistedGroupCollapseState(id);
            if (persistedState !== undefined) {
                return persistedState;
            }
        }
        return defaultCollapsed;
    };

    const [collapsed, setCollapsed] = useState(getInitialCollapseState());
    const collapsibleDivRef = useRef<HTMLDivElement | null>(null);
    const initStateSet = useRef(false);

    return (
        <div className={className}>
            <button
                className={classNames(
                    'tw-row tw-preflight tw- tw-flex tw-items-center tw-justify-between tw-text-left',
                    headingFullWidth && 'tw-w-full',
                    !collapsible && ' tw-cursor-default'
                )}
                type="button"
                onClick={() => {
                    if (!collapsible) return;

                    if (!collapsibleDivRef.current || !initStateSet.current)
                        return;

                    if (
                        collapsibleDivRef.current.getAttribute(
                            'data-animating'
                        ) === 'true'
                    )
                        return;

                    if (collapsed) {
                        expandSection(collapsibleDivRef.current);
                    } else {
                        collapseSection(collapsibleDivRef.current);
                    }

                    onToggled?.(collapsed);
                    setCollapsed(!collapsed);

                    if (persistCollapseState && id) {
                        persistGroupCollapseState(id, !collapsed);
                    }
                }}
            >
                <p
                    className="tw-text-[10px] tw-uppercase tw-tracking-[0.5ex]"
                    title={title}
                >
                    {heading}
                </p>
                {collapsible && (
                    <span
                        className={classNames(
                            'mdi mdi-chevron-down tw-inline tw-text-xl/3 tw-transition-transform',
                            !collapsed && 'tw-rotate-180'
                        )}
                    />
                )}
            </button>
            <div
                ref={ref => {
                    if (!initStateSet.current && ref) {
                        if (collapsed) {
                            collapseSection(ref);
                        } else {
                            expandSection(ref);
                        }
                        initStateSet.current = true;
                    }
                    collapsibleDivRef.current = ref;
                }}
                className={classNames(
                    'tw-transition-all',
                    !initStateSet.current && collapsed && 'tw-h-0',
                    !initStateSet.current && !collapsed && 'tw-h-full'
                )}
            >
                <div
                    className={classNames(
                        'tw-flex tw-flex-col tw-pt-4',
                        gap === 0.5 && 'tw-gap-0.5',
                        gap === 1 && 'tw-gap-1',
                        gap === 2 && 'tw-gap-2',
                        gap === 4 && 'tw-gap-4',
                        gap === 8 && 'tw-gap-8'
                    )}
                >
                    {children}
                </div>
            </div>
        </div>
    );
};
