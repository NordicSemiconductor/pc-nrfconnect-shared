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
    <Card className={className}>
        <Card.Header className="tw-text-center">
            <Card.Header.Title cardTitle="Documentation" />
        </Card.Header>
        <Card.Body className="tw-gap-4">{documentationSections}</Card.Body>
    </Card>
);
