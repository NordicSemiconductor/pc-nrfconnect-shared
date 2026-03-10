/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';

export type ButtonVariants =
    | 'primary'
    | 'primary-outline'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'link-button';

export type ButtonSize = 'sm' | 'lg' | 'xl';

type ButtonProps = {
    id?: string;
    variant: ButtonVariants;
    className?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    title?: string;
    size?: ButtonSize;
};

const Button: React.FC<ButtonProps> = ({
    children,
    id,
    className,
    variant,
    onClick,
    disabled = false,
    title,
    size = 'sm',
}) => {
    // Rust-style assignment from `if`/`match`
    const sizeStyles = (() => {
        switch (size) {
            case 'sm':
                return 'tw-h-6 tw-px-2 tw-text-xs';
            case 'lg':
                return 'tw-h-8 tw-px-4 tw-text-sm';
            case 'xl':
                return 'tw-h-8 tw-px-4 tw-text-base';
            default:
                return '';
        }
    })();
    const variantStyles = (() => {
        // TODO: put long strings on multiple lines using flatstr
        switch (variant) {
            case 'primary':
                return 'tw-border tw-border-transparent tw-bg-nordicBlue tw-text-white active:enabled:tw-bg-nordicBlue-700';
            case 'primary-outline':
                return 'tw-border tw-border-nordicBlue tw-bg-white tw-text-nordicBlue active:enabled:tw-bg-nordicBlue-50';
            case 'secondary':
                return 'tw-border tw-border-gray-700 tw-bg-white tw-text-gray-700 active:enabled:tw-bg-gray-50';
            case 'success':
                return 'tw-border tw-border-transparent tw-bg-green tw-text-white active:enabled:tw-bg-green-700';
            case 'info':
                return 'tw-border tw-border-transparent tw-bg-nordicBlue tw-text-white active:enabled:tw-bg-nordicBlue-700';
            case 'warning':
                return 'tw-border tw-border-transparent tw-bg-orange tw-text-white active:enabled:tw-bg-orange-700';
            case 'danger':
                return 'tw-border tw-border-transparent tw-bg-red tw-text-white active:enabled:tw-bg-red-700';
            case 'link-button':
                return 'tw-border tw-border-nordicBlue tw-bg-white tw-text-nordicBlue active:enabled:tw-bg-gray-50';
            default:
                return '';
        }
    })();

    return (
        <button
            type="button"
            id={id}
            className={`${classNames(
                'tw-preflight',
                sizeStyles,
                variantStyles,
                className,
            )}`}
            disabled={disabled}
            onClick={onClick}
            title={title}
        >
            {children}
        </button>
    );
};

export default Button;
