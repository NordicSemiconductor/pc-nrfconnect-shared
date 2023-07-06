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
    <div className="tw-mt-4 tw-flex tw-flex-col tw-gap-1 [&:first-child]:tw-mt-0">
        {title != null && <h3 className="tw-font-medium">{title}</h3>}
        <div className="tw-flex tw-flex-col tw-gap-4">{children}</div>
    </div>
);
