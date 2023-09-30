/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { transform as svgr } from '@svgr/core';
import autoprefixer from 'autoprefixer';
import esbuild, { BuildOptions } from 'esbuild';
import { postcssModules, sassPlugin } from 'esbuild-sass-plugin';
import postCssPlugin from 'esbuild-style-plugin';
import * as fs from 'node:fs';
import * as module from 'node:module';
import * as path from 'node:path';
import tailwindcss from 'tailwindcss';

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const projectSpecificTailwindConfigPath = path.join(
    process.cwd(),
    'tailwind.config.js'
);
const tailwindConfig = () =>
    fs.existsSync(projectSpecificTailwindConfigPath)
        ? projectSpecificTailwindConfigPath
        : require.resolve(
              '@nordicsemiconductor/pc-nrfconnect-shared/config/tailwind.config.js'
          );

type AdditionalOptions = Required<Pick<BuildOptions, 'entryPoints'>> &
    Partial<BuildOptions>;

const appHasOwnHtml = packageJson.nrfConnectForDesktop?.html !== undefined;

const outfileOrDir = (additionalOptions: AdditionalOptions) =>
    additionalOptions.entryPoints.length === 1
        ? { outfile: './dist/bundle.js' }
        : { outdir: './dist' };

const options = (additionalOptions: AdditionalOptions) =>
    ({
        format: appHasOwnHtml ? 'iife' : 'cjs',
        ...outfileOrDir(additionalOptions),
        target: 'chrome89',
        sourcemap: true,
        metafile: false,
        minify: process.argv.includes('--prod'),
        bundle: true,
        logLevel: 'info',
        external: [
            ...module.builtinModules,

            // launcher includes
            'electron',
            'serialport',
            '@electron/remote',
            ...(appHasOwnHtml ? [] : ['react']),

            // App dependencies
            ...Object.keys(packageJson.dependencies ?? {}),
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
                    plugins: [tailwindcss(tailwindConfig()), autoprefixer],
                },
            }),
            {
                name: 'svgr',
                setup(builder) {
                    const filter = /^!!@svgr!(.*\.svg)$/;

                    builder.onResolve({ filter }, args => {
                        // Rename file to .svgr to let this plugin handle it.
                        const [, shortpath] = filter.exec(args.path)!; // eslint-disable-line @typescript-eslint/no-non-null-assertion
                        const resolvedPath = `${path.join(
                            args.resolveDir,
                            shortpath
                        )}r`;
                        return { path: resolvedPath };
                    });

                    builder.onLoad({ filter: /\.svgr$/ }, async args => {
                        const filePath = args.path.replace('.svgr', '.svg');
                        const svg = await fs.promises.readFile(
                            filePath,
                            'utf8'
                        );
                        const plugins = ['@svgr/plugin-jsx'];
                        const contents = await svgr(svg, { plugins });
                        return {
                            contents,
                            loader: 'jsx',
                        };
                    });
                },
            },
        ],
        ...additionalOptions,
    } satisfies BuildOptions);

export const build = async (additionalOptions: AdditionalOptions) => {
    if (process.argv.includes('--watch')) {
        const context = await esbuild.context(options(additionalOptions));

        await context.rebuild();
        await context.watch();
    } else {
        esbuild.build(options(additionalOptions));
    }
};
