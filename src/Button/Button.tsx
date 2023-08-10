/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import classNames from '../utils/classNames';

export type ButtonVariants =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'info'
    | 'warning'
    | 'danger'
    | 'link'
    | 'link-button';

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
    <div className={`tw-preflight ${className}`}>
        <button
            type="button"
            id={id}
            className={`${classNames(
                large
                    ? 'tw-h-8 tw-px-4 tw-text-sm'
                    : 'tw-h-6 tw-px-2 tw-text-xs',
                variant === 'primary' &&
                    'tw-bg-nordicBlue tw-text-white active:enabled:tw-bg-nordicBlue-700',
                variant === 'secondary' &&
                    'tw-border tw-border-gray-700 tw-bg-white tw-text-gray-700  active:enabled:tw-bg-gray-50',
                variant === 'success' &&
                    'tw-bg-green tw-text-white  active:enabled:tw-bg-green-700',
                variant === 'info' &&
                    'tw-bg-nordicBlue tw-text-white active:enabled:tw-bg-nordicBlue-700',
                variant === 'warning' &&
                    'tw-bg-orange tw-text-white active:enabled:tw-bg-orange-700',
                variant === 'danger' &&
                    'tw-bg-red tw-text-white active:enabled:tw-bg-red-700',
                variant === 'link' &&
                    'tw-bg-transparent tw-p-0 tw-text-nordicBlue',
                variant === 'link-button' &&
                    'tw-border tw-border-nordicBlue tw-bg-white tw-text-nordicBlue active:enabled:tw-bg-gray-50',
                className
            )}`}
            disabled={disabled}
            onClick={onClick}
            title={title}
        >
            {children}
        </button>
    </div>
);

export default Button;
