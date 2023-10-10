#!/usr/bin/env ts-node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

import { parsePackageJson } from '../ipc/schema/packageJson';
import { build } from './esbuild-renderer';

const validate = (packageJson: string) => {
    const result = parsePackageJson(packageJson);

    if (!result.success) {
        console.log(result.error.message);
        process.exit(1);
    }
};

const entry = () => {
    const result = [
        './src/index.jsx',
        './lib/index.jsx',
        './index.jsx',
        './src/index.tsx',
    ].find(fs.existsSync);

    if (result == null) {
        throw new Error('Found no entry point file');
    }

    return result;
};

const bundle = () => {
    const packageJson = fs.readFileSync('package.json', 'utf8');

    validate(packageJson);

    build({
        define: {
            'process.env.PACKAGE_JSON_OF_APP': JSON.stringify(packageJson),
        },
        entryPoints: [entry()],
    });
};

const fileInShared = (file: string) =>
    require.resolve(`@nordicsemiconductor/pc-nrfconnect-shared/${file}`);

const fileInDist = (file: string) => path.join('dist', path.basename(file));

const copyFileToDist = (file: string) =>
    fs.copyFileSync(fileInShared(file), fileInDist(file));

const copyFiles = () => {
    fs.mkdirSync('dist', { recursive: true });

    copyFileToDist('scripts/nordic-publish.js');
    copyFileToDist('dist/bootstrap.css');
    copyFileToDist('src/index.html');

    if (process.argv.includes('--include-bootloader')) {
        fs.mkdirSync('fw', { recursive: true });

        fs.copyFileSync(
            fileInShared(
                'fw/bootloader/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip'
            ),
            './fw/graviton_bootloader_v1.0.1-[nRF5_SDK_15.0.1-1.alpha_f76d012].zip'
        );
    }
};

bundle();
copyFiles();
