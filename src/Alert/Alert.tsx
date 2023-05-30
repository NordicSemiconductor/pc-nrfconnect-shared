/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import BootstrapAlert from 'react-bootstrap/Alert';

import styles from './Alert.module.scss';

type Variant = 'info' | 'warning' | 'success' | 'danger';
export interface AlertProps {
    variant: Variant;
    label?: React.ReactNode;
    dismissable?: boolean;
    onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
    children,
    label,
    variant,
    dismissable = false,
    onClose,
}) => (
    <BootstrapAlert
        variant={variant}
        dismissible={dismissable}
        onClose={onClose}
        className={`${styles.container} ${styles[variant]}`}
    >
        {label && <strong>{label}</strong>}
        {/* eslint-disable-next-line react/jsx-no-useless-fragment -- I think we need a fragment because children could also be an array of components */}
        <>{children}</>
    </BootstrapAlert>
);
