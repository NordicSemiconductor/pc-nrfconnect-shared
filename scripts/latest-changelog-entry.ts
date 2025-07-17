#!/usr/bin/env -S npx tsx

/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { readFileSync } from 'node:fs';

const readChangelog = () => readFileSync('Changelog.md', 'utf-8');

export const getLatestEntry = (changelog = readChangelog()) => {
    const latestEntry = changelog.split(/(?:^|\n)## /)[1];

    const header = latestEntry.split('\n')[0];
    const content = latestEntry.replace(/[^\n]*/, '').trim();

    return { header, content };
};

const runAsScript = require.main === module;
if (runAsScript) {
    console.log(getLatestEntry().content);
}
