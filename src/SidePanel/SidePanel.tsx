/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';

import './sidepanel.scss';

const SidePanel = ({
    children,
    className = '',
}: {
    children?: React.ReactNode;
    className?: string;
}) => <div className={`core19-side-panel ${className}`}>{children}</div>;

export default SidePanel;
