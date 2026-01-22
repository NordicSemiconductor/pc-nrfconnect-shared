#!/usr/bin/env tsx

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { existsSync } from 'fs';
import { install as installHusky } from 'husky';

if (existsSync('.git')) {
    installHusky();
} else {
    console.log(
        `Not installing husky, because ${process.cwd()} is no git repo.`,
    );
}
