#!/usr/bin/env node
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const join = require('path').join;
const { sassPlugin, postcssModules } = require('esbuild-sass-plugin');
const esbuild = require('esbuild');
const svgr = require('@svgr/core').transform;

// eslint-disable-next-line import/no-dynamic-require
const { dependencies } = require(join(process.cwd(), 'package.json'));

const entry = [
    './src/index.jsx',
    './lib/index.jsx',
    './index.jsx',
    './src/index.tsx',
].find(fs.existsSync);

esbuild.build({
    entryPoints: [entry],
    outfile: './dist/bundle.js',
    target: 'chrome89',
    sourcemap: true,
    metafile: false,
    watch: process.argv.includes('--watch'),
    format: 'cjs',
    external: [
        // node
        'fs',
        'zlib',
        'os',
        'http',
        'child_process',
        'crypto',
        'path',
        'https',
        'net',
        'stream',
        'url',

        // launcher includes
        'electron',
        'serialport',
        '@electron/remote',
        'react',
        '@nordicsemiconductor/nrf-device-lib-js',

        // App dependencies
        ...Object.keys(dependencies),
    ],
    loader: {
        '.json': 'json',
        '.gif': 'file',
        '.svg': 'file',
        '.png': 'file',
        '.woff': 'file',
        '.woff2': 'file',
        '.eot': 'file',
        '.ttf': 'file',
    },
    bundle: true,
    write: true,
    plugins: [
        sassPlugin({
            filter: /\.(module|icss)\.scss/,
            quietDeps: false,
            cssImports: true,

            transform: postcssModules({}),
        }),
        sassPlugin({
            filter: /\.scss$/,
            cssImports: true,
            quietDeps: false,
        }),
        {
            name: 'svgr',
            setup(build) {
                const filter = /^!!@svgr\/webpack!(.*\.svg)$/;

                build.onResolve({ filter }, args => {
                    // Rename file to .svgr to let this plugin handle it.
                    const [, shortpath] = filter.exec(args.path);
                    const path = `${join(args.resolveDir, shortpath)}r`;
                    return { path };
                });

                build.onLoad({ filter: /\.svgr$/ }, async args => {
                    const filePath = args.path.replace('.svgr', '.svg');
                    const svg = await fs.promises.readFile(filePath, 'utf8');
                    const contents = await svgr(svg, { filePath });
                    return {
                        contents,
                        loader: 'jsx',
                    };
                });
            },
        },
        {
            name: 'build-time-feedback',
            setup(build) {
                build.onStart(() => {
                    console.time('Build time');
                });
                build.onEnd(() => {
                    console.timeEnd('Build time');
                });
            },
        },
    ],
});

fs.copyFileSync(
    join(
        process.cwd(),
        './node_modules/pc-nrfconnect-shared/scripts/nordic-publish.js'
    ),
    join(process.cwd(), 'dist', 'nordic-publish.js')
);
