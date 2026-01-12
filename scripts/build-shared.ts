#!/usr/bin/env tsx

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { build } from 'esbuild';
import { execSync } from 'node:child_process';

import { build as esbuildRenderer } from './esbuild-renderer';

const main = async () => {
    console.log('Generate types');
    execSync(
        'tsc --emitDeclarationOnly --declaration --declarationMap --outDir ./typings/generated --rootDir .',
        { encoding: 'utf-8', stdio: 'inherit' },
    );

    console.log('Build bootstrap.css');
    await esbuildRenderer({
        logLevel: 'warning',
        entryPoints: ['./src/bootstrap.scss'],
        outfile: 'dist/bootstrap.css',
        sourcemap: false,
    });

    console.log('Build nordic-publish.js');
    await build({
        entryPoints: ['scripts/nordic-publish.ts'],
        outdir: 'scripts/',
        bundle: true,
        platform: 'node',
        logLevel: 'warning',
        minify: true,
    });
};

main().catch(() => {
    process.exit(1);
});
