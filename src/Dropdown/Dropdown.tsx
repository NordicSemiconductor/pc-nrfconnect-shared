/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { useEffect, useState } from 'react';
import FormLabel from 'react-bootstrap/FormLabel';
import { arrayOf, bool, func, number, string } from 'prop-types';

import chevron from './chevron.svg';

import './Dropdown.scss';

interface DropdownProps {
    label?: string;
    items: string[];
    onSelect: (item: string, index: number) => void;
    disabled?: boolean;
    defaultIndex?: number;
}

const Dropdown: React.FC<DropdownProps> = ({
    label,
    items,
    disabled = false,
    onSelect,
    defaultIndex,
}) => {
    const [selected, setSelected] = useState(items[defaultIndex ?? 0]);
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

    return (
        <div className="dropdown-container">
            {label && <FormLabel className="dropdown-label">{label}</FormLabel>}
            <button
                type="button"
                className={`dropdown-btn dropdown-btn-${
                    isActive ? 'active' : 'inactive'
                }`}
                onClick={onClick}
                disabled={disabled}
            >
                <span>{selected}</span>
                <img src={chevron} alt="" />
            </button>
            <div
                className={`dropdown-content dropdown-${
                    isActive ? 'active' : 'inactive'
                }`}
            >
                {items.map((item, index) => (
                    <button
                        type="button"
                        className="dropdown-item"
                        key={item}
                        onClick={() => {
                            setSelected(item);
                            onSelect(item, index);
                        }}
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
};

Dropdown.propTypes = {
    label: string,
    items: arrayOf(string.isRequired).isRequired,
    onSelect: func.isRequired,
    disabled: bool,
    defaultIndex: number,
};

export default Dropdown;
