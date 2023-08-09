#!/usr/bin/env node

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const { resolve } = require('path');
const { build } = require('./esbuild-renderer');

const scripts = [
    'nordic-publish',
    'check-app-properties',
    'check-for-typescript',
    'nrfconnect-license',
];

scripts.forEach(script => {
    // compile scripts if they don't exist
    if (!existsSync(`scripts/${script}.js`)) {
        const command = `npx esbuild scripts/${script}.ts --bundle --outfile=scripts/${script}.js --platform=node --log-level=warning --minify`;
        execSync(command, { encoding: 'utf-8' });
    }
});

if (!existsSync(`dist/bootstrap.css`)) {
    build({
        logLevel: 'warning',
        entryPoints: ['./src/bootstrap.scss'],
        outfile: 'dist/bootstrap.css',
        sourcemap: false,
    });
}

const root = resolve(__dirname, '..');
const typingsFolder = resolve(__dirname, '../typings/generated');

// Generate types
execSync(
    `npx tsc --emitDeclarationOnly --declaration --declarationMap --outDir ${typingsFolder} --rootDir ${root}`,
    { encoding: 'utf-8' }
);
