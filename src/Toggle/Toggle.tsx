/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode, useState } from 'react';
import { bool, func, node, oneOf, string } from 'prop-types';

import classNames from '../utils/classNames';

import './toggle.scss';

interface Props {
    id?: string;
    title?: string;
    isToggled?: boolean;
    onToggle?: (isToggled: boolean) => void;
    label?: string;
    labelRight?: boolean;
    variant?: 'primary' | 'secondary';
    barColor?: string;
    barColorToggled?: string;
    handleColor?: string;
    handleColorToggled?: string;
    width?: string;
    disabled?: boolean;
    children?: ReactNode;
}

export const Toggle: FC<Props> = ({
    id,
    title,
    isToggled,
    onToggle,
    label,
    labelRight = false,
    variant = 'primary',
    barColor,
    barColorToggled,
    handleColor,
    handleColorToggled,
    width,
    disabled = false,
    children,
}) => {
    const isControlled = isToggled !== undefined;
    const [internalToggled, setInternalToggled] = useState(!!isToggled);
    const toggled = isControlled ? isToggled : internalToggled;
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';

    const handleToggle = () => {
        if (onToggle) {
            onToggle(!toggled);
        }
        if (!isControlled) {
            setInternalToggled(!internalToggled);
        }
    };

    const [labelText, ...remainingChildren] = Array.isArray(children)
        ? children
        : [children || label];

    const labelElement = labelText && (
        <span className="toggle-label">{labelText}</span>
    );

    return (
        <div
            title={title}
            className={classNames('toggle', disabled && 'disabled')}
            style={{ width }}
        >
            <label htmlFor={id}>
                {!labelRight && labelElement}
                <div
                    className={classNames(
                        'toggle-bar',
                        isPrimary && 'toggle-bar-primary',
                        isSecondary && 'toggle-bar-secondary'
                    )}
                    style={{
                        backgroundColor: toggled ? barColorToggled : barColor,
                    }}
                >
                    <input
                        id={id}
                        type="checkbox"
                        checked={toggled}
                        onChange={disabled ? undefined : handleToggle}
                        aria-checked={toggled}
                        disabled={disabled}
                    />
                    <span
                        className={classNames(
                            'toggle-handle',
                            isPrimary && 'toggle-handle-primary',
                            isSecondary && 'toggle-handle-secondary',
                            toggled && 'toggle-handle-toggled',
                            toggled &&
                                isPrimary &&
                                'toggle-handle-primary-toggled',
                            toggled &&
                                isSecondary &&
                                'toggle-handle-secondary-toggled'
                        )}
                        style={{
                            backgroundColor: toggled
                                ? handleColorToggled
                                : handleColor,
                        }}
                    />
                </div>
                {labelRight && labelElement}
            </label>
            {remainingChildren.length > 0 && (
                <div className="toggle-label toggle-label-rest">
                    {remainingChildren}
                </div>
            )}
        </div>
    );
};

Toggle.propTypes = {
    id: string,
    title: string,
    isToggled: bool,
    onToggle: func,
    variant: oneOf(['primary', 'secondary']),
    barColor: string,
    barColorToggled: string,
    handleColor: string,
    handleColorToggled: string,
    label: string,
    labelRight: bool,
    width: string,
    disabled: bool,
    children: node,
};
