/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

interface Props {
    title?: string;
    children?: ReactNode;
}

export default ({ children, title }: Props) => (
    <div className="tw-preflight tw-w-full">
        {title != null && <h3 className="tw-pb-1 tw-font-medium">{title}</h3>}
        <div className="tw-flex tw-flex-col tw-flex-wrap tw-gap-4">
            {children}
        </div>
    </div>
);
