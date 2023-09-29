#!/usr/bin/env node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const { join, basename } = require('path');
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

const fileInShared = file =>
    require.resolve(`@nordicsemiconductor/pc-nrfconnect-shared/${file}`);

const fileInDist = file => join(distFolder, basename(file));

const copyFileToDist = file =>
    fs.copyFileSync(fileInShared(file), fileInDist(file));

copyFileToDist('scripts/nordic-publish.js');
copyFileToDist('dist/bootstrap.css');
copyFileToDist('src/index.html');

if (process.argv.includes('--include-bootloader')) {
    if (!fs.existsSync(`${process.cwd()}/fw`)) {
        fs.mkdirSync(`${process.cwd()}/fw`);
    }

    fs.copyFileSync(
        fileInShared(
            'fw/bootloader/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip'
        ),
        join(
            process.cwd(),
            './fw/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip'
        )
    );
}
