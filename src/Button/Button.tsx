/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { bool, func, string } from 'prop-types';

import classNames from '../utils/classNames';

import styles from './button.module.scss';

type NrfButtonProps = {
    id?: string;
    className?: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
    title?: string;
};

const NrfButton: React.FC<NrfButtonProps> = ({
    children,
    id,
    className,
    onClick,
    disabled = false,
    title,
}) => (
    <button
        type="button"
        id={id}
        className={classNames(styles.button, className)}
        disabled={disabled}
        onClick={onClick}
        title={title}
    >
        {children}
    </button>
);

NrfButton.propTypes = {
    id: string,
    className: string,
    onClick: func.isRequired,
    disabled: bool,
    title: string,
};

export default NrfButton;
