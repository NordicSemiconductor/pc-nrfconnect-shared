/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { isDevelopment } from '../utils/environment';
import { packageJson } from '../utils/packageJson';

const formURL =
    isDevelopment === true
        ? 'https://formkeep.com/f/87deb409a565'
        : 'https://formkeep.com/f/36b394b92851';

export default async (feedback: string, category?: string) => {
    const data: Record<string, unknown> = {
        name: packageJson().name,
        feedback,
        platform: process.platform,
    };

    if (category && category !== 'Select a category') {
        data.category = category;
    }

    const response = await fetch(formURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
            enctype: 'multipart/form-data',
        },
    });

    if (response.ok) {
        return;
    }

    throw new Error(`Server responded with status code ${response.status}`);
};
