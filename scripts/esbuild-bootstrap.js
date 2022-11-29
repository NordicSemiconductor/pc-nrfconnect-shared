#!/usr/bin/env node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const { build } = require('./esbuild-renderer');

build({
    logLevel: 'warning',
    entryPoints: ['./src/bootstrap.scss'],
    outfile: 'dist/bootstrap.css',
});
