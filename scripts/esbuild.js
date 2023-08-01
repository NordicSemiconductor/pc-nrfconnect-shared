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

build({ entryPoints: [entry] });

const distFolder = join(process.cwd(), 'dist');
if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
}

fs.copyFileSync(
    join(
        process.cwd(),
        './node_modules/@nordicsemiconductor/pc-nrfconnect-shared/scripts/nordic-publish.js'
    ),
    join(distFolder, 'nordic-publish.js')
);

fs.copyFileSync(
    join(
        process.cwd(),
        './node_modules/@nordicsemiconductor/pc-nrfconnect-shared/dist/bootstrap.css'
    ),
    join(distFolder, 'bootstrap.css')
);

if (process.argv.includes('--include-bootloader')) {
    if (!fs.existsSync(`${process.cwd()}/fw`)) {
        fs.mkdirSync(`${process.cwd()}/fw`);
    }

    fs.copyFileSync(
        join(
            process.cwd(),
            './node_modules/@nordicsemiconductor/pc-nrfconnect-shared/fw/bootloader/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip'
        ),
        join(
            process.cwd(),
            './fw/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip'
        )
    );
}
