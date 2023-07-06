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
    <div className="tw-mt-4 [&:first-child]:tw-mt-0">
        {title != null && <h3 className="tw-mb-1 tw-font-medium">{title}</h3>}
        <div className="[&>*]:tw-mb-4">{children}</div>
    </div>
);
