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
    label: React.ReactElement | string;
}

export const Alert: React.FC<AlertProps> = ({ children, label, variant }) => (
    <BootstrapAlert
        variant={variant}
        className={`${styles.container} ${styles[variant]}`}
    >
        {label && <strong>{label}</strong>} <>{children}</>
    </BootstrapAlert>
);
