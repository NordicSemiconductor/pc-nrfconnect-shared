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
    | 'link'
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
            variant !== 'custom' && styles.button,
            large && styles.large,
            styles[variant],
            className,
            'tw-m-2'
        )}
        disabled={disabled}
        onClick={onClick}
        title={title}
    >
        {children}
    </button>
);

export default Button;
