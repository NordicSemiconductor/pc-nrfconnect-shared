/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import './main.scss';

export default ({ children }: { children?: ReactNode }) => (
    <div className="core19-main-view">{children}</div>
);
