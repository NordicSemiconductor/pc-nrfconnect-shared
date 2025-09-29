/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { FC, ReactNode } from 'react';

import classNames from '../utils/classNames';

import './toggle.scss';

export interface Props {
    id?: string;
    title?: string;
    isToggled: boolean;
    onToggle?: (isToggled: boolean) => void;
    label?: ReactNode;
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
    const isPrimary = variant === 'primary';
    const isSecondary = variant === 'secondary';

    const handleToggle = () => {
        if (onToggle) {
            onToggle(!isToggled);
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
                        isPrimary &&
                            `toggle-bar-primary${isToggled ? '-toggled' : ''}`,
                        isSecondary &&
                            `toggle-bar-secondary${isToggled ? '-toggled' : ''}`,
                    )}
                    style={{
                        backgroundColor: isToggled ? barColorToggled : barColor,
                    }}
                >
                    <input
                        id={id}
                        type="checkbox"
                        checked={isToggled}
                        onChange={disabled ? undefined : handleToggle}
                        aria-checked={isToggled}
                        disabled={disabled}
                    />
                    <span
                        className={classNames(
                            'toggle-handle',
                            isToggled && 'toggle-handle-toggled',
                            isPrimary &&
                                `toggle-handle-primary${
                                    isToggled ? '-toggled' : ''
                                }`,
                            isSecondary &&
                                `toggle-handle-secondary${
                                    isToggled ? '-toggled' : ''
                                }`,
                        )}
                        style={{
                            backgroundColor: isToggled
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
