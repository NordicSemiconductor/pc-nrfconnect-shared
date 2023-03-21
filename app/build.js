#!/usr/bin/env node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

// const fs = require('fs');
const path = require('path');
const { build } = require('../scripts/esbuild-renderer');

build({
    entryPoints: ['./app/index.tsx'],
    watch: true,
    // absWorkingDir: path.resolve(__dirname, '..', '.'),
    plugins: [
        {
            name: 'rewrite',
            setup(builder) {
                const filter = /^\.\.\/\.\.\/\.\.\/\.\.\/package\.json$/;

                builder.onResolve({ filter }, args => ({
                    path: '/home/jonas/.nrfconnect-apps/local/pc-nrfconnect-shared/package.json',
                }));
            },
        },
    ],
});

// const distFolder = join(process.cwd(), 'dist');
// if (!fs.existsSync(distFolder)) {
//     fs.mkdirSync(distFolder);
// }

// fs.copyFileSync(
//     join(process.cwd(), '../dist/bootstrap.css'),
//     join(distFolder, 'bootstrap.css')
// );
