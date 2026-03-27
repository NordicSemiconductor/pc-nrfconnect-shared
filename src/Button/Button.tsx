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

type ButtonSize = 'sm' | 'lg' | 'xl';

type PickedButtonProps =
    | 'ref'
    | 'key'
    | 'className'
    | 'disabled'
    | 'onClick'
    | 'title';

interface ButtonProps
    extends Pick<React.ComponentPropsWithRef<'button'>, PickedButtonProps> {
    variant: ButtonVariants;
    size?: ButtonSize;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className,
    variant,
    size = 'sm',
    ...attrs
}) => (
    <button
        type="button"
        className={`${classNames(
            'tw-preflight',
            size === 'sm' && 'tw-h-6 tw-px-2 tw-text-xs',
            size === 'lg' && 'tw-h-8 tw-px-4 tw-text-sm',
            size === 'xl' && 'tw-h-8 tw-px-4 tw-text-base',
            variant === 'primary' &&
                'tw-border tw-border-transparent tw-bg-nordicBlue tw-text-white active:enabled:tw-bg-nordicBlue-700',
            variant === 'primary-outline' &&
                'tw-border tw-border-nordicBlue tw-bg-white tw-text-nordicBlue active:enabled:tw-bg-nordicBlue-50',
            variant === 'secondary' &&
                'tw-border tw-border-gray-700 tw-bg-white tw-text-gray-700 active:enabled:tw-bg-gray-50',
            variant === 'success' &&
                'tw-border tw-border-transparent tw-bg-green tw-text-white active:enabled:tw-bg-green-700',
            variant === 'info' &&
                'tw-border tw-border-transparent tw-bg-nordicBlue tw-text-white active:enabled:tw-bg-nordicBlue-700',
            variant === 'warning' &&
                'tw-border tw-border-transparent tw-bg-orange tw-text-white active:enabled:tw-bg-orange-700',
            variant === 'danger' &&
                'tw-border tw-border-transparent tw-bg-red tw-text-white active:enabled:tw-bg-red-700',
            variant === 'link-button' &&
                'tw-border tw-border-nordicBlue tw-bg-white tw-text-nordicBlue active:enabled:tw-bg-gray-50',
            className,
        )}`}
        {...attrs}
    >
        {children}
    </button>
);

export default Button;
