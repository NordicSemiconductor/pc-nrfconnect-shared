/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { Spinner } from 'react-bootstrap';

export default ({
    size,
    className,
}: {
    size: 'sm' | 'lg';
    className?: string;
}) => (
    <Spinner
        size={size === 'sm' ? 'sm' : undefined}
        animation="border"
        className={`tw-preflight tw-border ${className || ''}`}
    />
);
