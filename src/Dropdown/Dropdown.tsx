/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
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

const Dropdown: React.FC<DropdownProps> = ({
    label,
    items,
    onSelect,
    disabled = false,
    selectedItem,
    numItemsBeforeScroll = 0,
}) => {
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const clickEvent = () => setIsActive(!isActive);

        if (isActive) {
            window.addEventListener('click', clickEvent);
        }

        return () => {
            window.removeEventListener('click', clickEvent);
        };
    }, [isActive]);

    const onClick = () => setIsActive(!isActive);

    const onClickItem = (item: DropdownItem) => {
        onSelect(item);
    };

    return (
        <div className={styles.container}>
            {label && <FormLabel className={styles.label}>{label}</FormLabel>}
            <button
                type="button"
                className={`${styles.btn} ${
                    isActive ? styles.btnActive : styles.btnInactive
                }`}
                onClick={onClick}
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

export default Dropdown;
