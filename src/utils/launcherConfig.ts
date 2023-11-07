/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type Configuration, inMain } from '../../ipc/launcherConfig';

let cachedConfig: Configuration;

export default () => {
    if (cachedConfig == null) {
        cachedConfig = inMain.getConfig();
    }

    return cachedConfig;
};
