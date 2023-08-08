#!/usr/bin/env node

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const scripts = [
    'nordic-publish',
    'check-app-properties',
    'check-for-typescript',
    'nrfconnect-license',
];
const { execSync } = require('child_process');

scripts.forEach(script => {
    const command = `npx esbuild scripts/${script}.ts --bundle --outfile=scripts/${script}.js --platform=node --log-level=warning --minify`;
    execSync(command);
});
