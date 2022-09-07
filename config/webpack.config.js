/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const fs = require('fs');
const path = require('path');

// eslint-disable-next-line import/no-dynamic-require
const { dependencies } = require(path.join(process.cwd(), 'package.json'));

const appDirectory = fs.realpathSync(process.cwd());

const externals = Object.fromEntries(
    [
        'react',
        'react-dom',
        'react-redux',
        'redux-devtools-extension',
        'redux-thunk',
        'electron',
        '@electron/remote',
        'serialport',
        '@nordicsemiconductor/nrf-device-lib-js',
        'osx-temperature-sensor',
        ...Object.keys(dependencies),
    ].map(lib => [lib, lib])
);

const entry = [
    './src/index.jsx',
    './lib/index.jsx',
    './index.jsx',
    './src/index.tsx',
].find(fs.existsSync);

module.exports = (_, argv) => {
    const mode = argv.mode ?? 'production';
    const isProd = mode === 'production';

    return {
        mode,
        devtool: isProd ? 'source-map' : 'cheap-eval-source-map',
        entry,
        output: {
            path: path.join(appDirectory, 'dist'),
            publicPath: './dist/',
            filename: 'bundle.js',
            libraryTarget: 'umd',
        },
        module: {
            rules: [
                {
                    test: /\.(jsx?|tsx?)$/,
                    use: [
                        {
                            loader: require.resolve('babel-loader'),
                            options: {
                                cacheDirectory: true,
                                configFile:
                                    './node_modules/pc-nrfconnect-shared/config/babel.config.js',
                            },
                        },
                    ],
                    exclude: /node_modules\/(?!pc-nrfconnect-shared\/)/,
                },
                {
                    test: /\.scss|\.css$/,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'sass-loader',
                            options: {
                                // eslint-disable-next-line global-require
                                implementation: require('sass'),
                            },
                        },
                    ],
                },
                {
                    test: /\.(png|gif|ttf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
                    loader: require.resolve('url-loader'),
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
        target: 'electron-renderer',
        externals,
    };
};
