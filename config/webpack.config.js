/*
 * Copyright (c) 2021 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

const ESLintPlugin = require('eslint-webpack-plugin');
const fs = require('fs');
const path = require('path');

const { dependencies } = require(path.join(process.cwd(), 'package.json'));

const appDirectory = fs.realpathSync(process.cwd());

const createExternals = () => {
    const coreLibs = [
        'react',
        'react-dom',
        'react-redux',
        'redux-devtools-extension',
        'redux-thunk',
        'electron',
        '@electron/remote',
        'serialport',
        'pc-ble-driver-js',
        '@nordicsemiconductor/nrf-device-lib-js',
        'osx-temperature-sensor',
    ];

    // Libs provided by the app at runtime
    const appLibs = Object.keys(dependencies);

    return coreLibs
        .concat(appLibs)
        .reduce((prev, lib) => Object.assign(prev, { [lib]: lib }), {});
};

const eslintConfig = require.resolve('./eslintrc.json');

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
        devtool: isProd ? 'source-map' : 'inline-cheap-source-map',
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
        plugins: [
            new ESLintPlugin({
                extensions: ['ts', 'tsx', 'js', 'jsx'],
                overrideConfigFile: eslintConfig,
            }),
        ],
        target: 'electron-renderer',
        externals: createExternals(),
    };
};
