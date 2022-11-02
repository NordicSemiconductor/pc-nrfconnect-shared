/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useRef, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';

import chevron from './chevron.svg';

import styles from './Dropdown.module.scss';

const useSynchronisationIfChangedFromOutside: <T>(
    v: T,
    set: (value: T) => void
) => void = (externalValue, setInternalValue) => {
    const previousExternalValue = useRef(externalValue);
    useEffect(() => {
        if (previousExternalValue.current !== externalValue) {
            setInternalValue(externalValue);
            previousExternalValue.current = externalValue;
        }
    });
};

export interface DropdownItem {
    label: string;
    value: string;
}

export interface DropdownProps {
    label?: string;
    items: DropdownItem[];
    onSelect: (item: DropdownItem) => void;
    disabled?: boolean;
    defaultIndex?: number;
    selectedItem?: DropdownItem;
    numItemsBeforeScroll?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    items,
    onSelect,
    disabled = false,
    defaultIndex = 0,
    selectedItem = items[defaultIndex],
    numItemsBeforeScroll = 0,
}) => {
    const selectedDropdownItem = items.find(
        e => e.value === selectedItem.value
    );

    const [selected, setSelected] = useState(
        selectedDropdownItem as DropdownItem
    );
    const [isActive, setIsActive] = useState(false);

    useSynchronisationIfChangedFromOutside<DropdownItem>(
        selectedItem,
        setSelected
    );

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
        setSelected(item);
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
                    {items.findIndex(e => e.value === selected.value) === -1
                        ? ''
                        : selected.label}
                </span>
                <img className={styles.image} src={chevron} alt="" />
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

Dropdown.propTypes = {
    label: string,
    items: arrayOf(
        shape({
            label: string.isRequired,
            value: string.isRequired,
        }).isRequired
    ).isRequired,
    onSelect: func.isRequired,
    disabled: bool,
    defaultIndex: number,
};

export default Dropdown;
