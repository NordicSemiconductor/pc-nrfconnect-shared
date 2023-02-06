/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, func, string } from 'prop-types';

import classNames from '../utils/classNames';

import styles from './button.module.scss';

type ButtonProps = {
    id?: string;
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
    onClick,
    disabled = false,
    title,
    large = false,
}) => (
    <button
        type="button"
        id={id}
        className={classNames(styles.button, large && styles.large, className)}
        disabled={disabled}
        onClick={onClick}
        title={title}
    >
        {children}
    </button>
);

Button.propTypes = {
    id: string,
    className: string,
    onClick: func.isRequired,
    disabled: bool,
    title: string,
};

export default Button;
