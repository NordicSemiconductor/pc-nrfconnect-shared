/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type AppDetailsFromLauncher, inMain } from '../../ipc/appDetails';
import { isLauncher } from './packageJson';

let cached: AppDetailsFromLauncher;

export default async () => {
    if (isLauncher()) {
        throw new Error('Must not be called by the launcher.');
    }

    if (cached == null) {
        cached = await inMain.getAppDetails();
    }

    return cached;
};
