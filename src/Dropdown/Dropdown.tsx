/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';

import classNames from '../utils/classNames';

import styles from './Dropdown.module.scss';

export interface DropdownItem {
    label: React.ReactNode;
    value: string;
}

export interface DropdownProps {
    id?: string;
    label?: React.ReactNode;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    disabled?: boolean;
    selectedItem: DropdownItem;
    numItemsBeforeScroll?: number;
    className?: string;
}

export default ({
    id,
    label,
    items,
    onSelect,
    disabled = false,
    selectedItem,
    numItemsBeforeScroll = 0,
    className = '',
}: DropdownProps) => {
    const [isActive, setIsActive] = useState(false);

    const onClickItem = (item: DropdownItem) => {
        onSelect(item);
        setIsActive(false);
    };

    return (
        <div
            className={classNames(styles.container, className)}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsActive(false);
                }
            }}
        >
            {label && <FormLabel className={styles.label}>{label}</FormLabel>}
            <button
                id={id}
                type="button"
                className={classNames(styles.btn, isActive && styles.btnActive)}
                onClick={() => setIsActive(!isActive)}
                disabled={disabled}
            >
                <span>
                    {items.findIndex(e => e.value === selectedItem.value) === -1
                        ? ''
                        : selectedItem.label}
                </span>
                <span className={`mdi mdi-chevron-down ${styles.mdi}`} />
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
                              maxHeight: `${
                                  numItemsBeforeScroll *
                                  Number.parseInt(styles.dropdownItemHeight, 10)
                              }px`,
                          }
                        : {}
                }
                data-height={
                    numItemsBeforeScroll > 0 &&
                    items.length > numItemsBeforeScroll
                }
                className={`${styles.content} ${
                    isActive ? styles.itemsActive : styles.itemsInactive
                }`}
            >
                {items.map(item => (
                    <button
                        type="button"
                        className={styles.item}
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
