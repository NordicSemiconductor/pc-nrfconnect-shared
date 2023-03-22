/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useRef, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';

import styles from './Dropdown.module.scss';

export interface DropdownItem {
    label: string;
    value: string;
}

export interface DropdownProps {
    label?: string;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    disabled?: boolean;
    selectedItem: DropdownItem;
    numItemsBeforeScroll?: number;
}

export default ({
    label,
    items,
    onSelect,
    disabled = false,
    selectedItem,
    numItemsBeforeScroll = 0,
}: DropdownProps) => {
    const isActiveRef = useRef(false);
    const [isActive, setIsActive] = useState(isActiveRef.current);

    const updateIsActive = (state: boolean) => {
        isActiveRef.current = state;
        setIsActive(isActiveRef.current);
    };

    const onClickItem = (item: DropdownItem) => {
        onSelect(item);
        updateIsActive(false);
    };

    return (
        <div
            className={styles.container}
            onBlur={event => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    updateIsActive(false);
                }
            }}
        >
            {label && <FormLabel className={styles.label}>{label}</FormLabel>}
            <button
                type="button"
                className={`${styles.btn} ${
                    isActive ? styles.btnActive : styles.btnInactive
                }`}
                onClick={() => updateIsActive(!isActive)}
                disabled={disabled}
            >
                <span>
                    {items.findIndex(e => e.value === selectedItem.value) === -1
                        ? ''
                        : selectedItem.label}
                </span>
                <span className={`mdi mdi-chevron-down ${styles.mdi}`} />
            </button>
            <div
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
