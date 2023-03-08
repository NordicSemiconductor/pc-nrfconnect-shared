/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';

import styles from './button.module.scss';

export type ButtonVariants =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'custom';

type ButtonProps = {
    id?: string;
    variant: ButtonVariants;
    className?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    title?: string;
    large?: boolean;
};

const Button: React.FC<ButtonProps> = ({
    children,
    id,
    className,
    variant,
    onClick,
    disabled = false,
    title,
    large = false,
}) => (
    <button
        type="button"
        id={id}
        className={classNames(
            styles.button,
            large && styles.large,
            variant === 'primary' && styles.primary,
            variant === 'secondary' && styles.secondary,
            variant === 'success' && styles.success,
            variant === 'info' && styles.info,
            variant === 'warning' && styles.warning,
            variant === 'danger' && styles.danger,
            className
        )}
        disabled={disabled}
        onClick={onClick}
        title={title}
    >
        {children}
    </button>
);

export default Button;
