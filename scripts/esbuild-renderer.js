/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const join = require('path').join;
const { sassPlugin, postcssModules } = require('esbuild-sass-plugin');
const esbuild = require('esbuild');
const svgr = require('@svgr/core').transform;

/**
 * @param {esbuild.BuildOptions} options Esbuild options
 * @param {'iife'|'cjs'|'esm'} format Cjs for require() renderers
 * @returns {void}
 */
module.exports.build = options => {
    const { dependencies } = JSON.parse(
        fs.readFileSync('package.json', 'utf8')
    );

    const outfile =
        options.entryPoints.length === 1 ? './dist/bundle.js' : undefined;
    const outdir = outfile ? undefined : './dist';

    esbuild.build({
        format: 'cjs',
        outfile,
        outdir,
        target: 'chrome89',
        sourcemap: true,
        metafile: false,
        watch: process.argv.includes('--watch'),
        minify: process.argv.includes('--prod'),
        bundle: true,
        logLevel: 'info',
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
            'module',
            'constants',

            // launcher includes
            'electron',
            'serialport',
            '@electron/remote',
            'react',
            '@nordicsemiconductor/nrf-device-lib-js',

            // App dependencies
            ...Object.keys(dependencies ?? {}),
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
                setup(builder) {
                    const filter = /^!!@svgr\/webpack!(.*\.svg)$/;

                    builder.onResolve({ filter }, args => {
                        // Rename file to .svgr to let this plugin handle it.
                        const [, shortpath] = filter.exec(args.path);
                        const path = `${join(args.resolveDir, shortpath)}r`;
                        return { path };
                    });

                    builder.onLoad({ filter: /\.svgr$/ }, async args => {
                        const filePath = args.path.replace('.svgr', '.svg');
                        const svg = await fs.promises.readFile(
                            filePath,
                            'utf8'
                        );
                        const contents = await svgr(svg, { filePath });
                        return {
                            contents,
                            loader: 'jsx',
                        };
                    });
                },
            },
        ],
        ...options,
    });
};
