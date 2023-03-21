#!/usr/bin/env node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
const path = require('path');
const { build } = require('../scripts/esbuild-renderer');

build({
    entryPoints: ['./app/index.tsx'],
    watch: true,

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
