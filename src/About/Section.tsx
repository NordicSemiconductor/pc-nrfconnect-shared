/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import './section.scss';

interface Props {
    title?: string;
    children?: ReactNode;
}

export default ({ children, title }: Props) => (
    <div className="about-section">
        {title != null && <h3 className="about-section-title">{title}</h3>}
        {children}
    </div>
);
