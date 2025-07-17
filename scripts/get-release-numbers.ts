/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { execSync } from 'node:child_process';

const getLatestReleaseName = () => {
    const latestReleaseJson = execSync(`gh release view --json tagName`, {
        encoding: 'utf-8',
    });
    const latestRelease = JSON.parse(latestReleaseJson) as { tagName: string };

    return latestRelease.tagName;
};

export default (latestReleaseName = getLatestReleaseName()) => {
    const latest = Number(
        /^v(?<versionNumber>\d+)$/.exec(latestReleaseName)?.groups
            ?.versionNumber
    );

    return { latest, next: latest + 1 };
};
