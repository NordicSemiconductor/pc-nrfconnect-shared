#!/usr/bin/env tsx

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { exec } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { build } from './esbuild-renderer';

if (!existsSync(`scripts/nordic-publish.js`)) {
    console.log('Building nordic-publish.js');
    const command = `npx esbuild scripts/nordic-publish.ts --bundle --outfile=scripts/nordic-publish.js --platform=node --log-level=warning --minify`;
    exec(command, { encoding: 'utf-8' });
}

if (!existsSync(`dist/bootstrap.css`)) {
    console.log('Building bootstrap.css');
    build({
        logLevel: 'warning',
        entryPoints: ['./src/bootstrap.scss'],
        outfile: 'dist/bootstrap.css',
        sourcemap: false,
    });
}

if (!existsSync(`typings/generated/src/index.d.ts`)) {
    console.log('Generating types');
    const root = resolve(__dirname, '..');
    process.chdir(root);

    exec('npm run generate-types', { encoding: 'utf-8' });
}
