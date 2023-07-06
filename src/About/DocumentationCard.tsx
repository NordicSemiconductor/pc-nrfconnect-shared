/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import React, { ReactNode } from 'react';

import Card from '../Card/Card';

export default ({
    documentationSections,
}: {
    documentationSections: ReactNode[];
}) => (
    <Card title="Documentation">
        <div className="tw-flex tw-flex-col tw-flex-wrap tw-gap-4">
            {documentationSections}
        </div>
    </Card>
);
