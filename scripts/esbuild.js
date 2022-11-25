#!/usr/bin/env node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const join = require('path').join;
const { build } = require('./esbuild-renderer');

const entry = [
    './src/index.jsx',
    './lib/index.jsx',
    './index.jsx',
    './src/index.tsx',
].find(fs.existsSync);

build([entry]);

fs.copyFileSync(
    join(
        process.cwd(),
        './node_modules/pc-nrfconnect-shared/scripts/nordic-publish.js'
    ),
    join(process.cwd(), 'dist', 'nordic-publish.js')
);
