/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { type ReactNode } from 'react';

import Card from '../Card/Card';

export interface DocumentationCardProps {
    documentationSections: Array<ReactNode>;
    className?: string;
}

export default ({
    documentationSections,
    className,
}: DocumentationCardProps) => (
    <Card title="Documentation" className={className}>
        <div className="tw-flex tw-flex-col tw-flex-wrap tw-gap-4">
            {documentationSections}
        </div>
    </Card>
);
