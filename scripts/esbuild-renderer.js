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
const builtinModules = require('module').builtinModules;
const postCssPlugin = require('esbuild-style-plugin');
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');
const { require } = require('yargs');

function options(additionalOptions) {
    const { dependencies } = JSON.parse(
        fs.readFileSync('package.json', 'utf8')
    );

    const outfile =
        additionalOptions.entryPoints.length === 1
            ? './dist/bundle.js'
            : undefined;
    const outdir = outfile ? undefined : './dist';

    return {
        format: 'cjs',
        outfile,
        outdir,
        target: 'chrome89',
        sourcemap: true,
        metafile: false,
        minify: process.argv.includes('--prod'),
        bundle: true,
        logLevel: 'info',
        external: [
            ...builtinModules,

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
                cssImports: true,
                quietDeps: false,

                transform: postcssModules({}),
            }),
            sassPlugin({
                filter: /\.scss$/,
                cssImports: true,
                quietDeps: false,
            }),
            postCssPlugin({
                postcss: {
                    plugins: [
                        tailwindcss(
                            './node_modules/pc-nrfconnect-shared/config/tailwind.config.js'
                        ),
                        autoprefixer,
                    ],
                },
            }),
            {
                name: 'svgr',
                setup(builder) {
                    const filter = /^!!@svgr!(.*\.svg)$/;

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
                        const plugins = ['@svgr/plugin-jsx'];
                        const contents = await svgr(svg, { filePath, plugins });
                        return {
                            contents,
                            loader: 'jsx',
                        };
                    });
                },
            },
        ],
        ...additionalOptions,
    };
}

const build = additionalOptions => esbuild.build(options(additionalOptions));

const watch = async additionalOptions => {
    const context = await esbuild.context(options(additionalOptions));

    await context.rebuild();
    await context.watch();
};

module.exports.build = additionalOptions => {
    if (process.argv.includes('--watch')) {
        watch(additionalOptions);
    } else {
        build(additionalOptions);
    }
};
