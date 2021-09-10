/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React from 'react';
import { string } from 'prop-types';

import './sidepanel.scss';

const SidePanel: React.FC<{
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={`core19-side-panel ${className}`}>{children}</div>
);

SidePanel.propTypes = {
    className: string,
};

export default SidePanel;
