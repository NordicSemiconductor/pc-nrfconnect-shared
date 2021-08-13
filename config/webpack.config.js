const webpack = require('webpack');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const ESLintPlugin = require('eslint-webpack-plugin');

const { dependencies } = require(path.join(process.cwd(), 'package.json'));

const appDirectory = fs.realpathSync(process.cwd());
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';

function createExternals() {
    // Libs provided by nRF Connect at runtime
    const coreLibs = [
        'react',
        'react-dom',
        'react-redux',
        'redux-devtools-extension',
        'redux-thunk',
        'electron',
        'serialport',
        'pc-ble-driver-js',
        'pc-nrfjprog-js',
        'usb',
        'nrf-device-setup',
        'nrfconnect/core',
        'pc-nrfconnect-shared',
        '@nordicsemiconductor/nrf-device-lib-js',
    ];

    // Libs provided by the app at runtime
    const appLibs = Object.keys(dependencies);

    return coreLibs
        .concat(appLibs)
        .reduce((prev, lib) => Object.assign(prev, { [lib]: lib }), {});
}

const eslintConfig = () => {
    try {
        return require.resolve('../../../.eslintrc');
    } catch (err) {
        return require.resolve('./eslintrc.json');
    }
};

function findEntryPoint() {
    const files = [
        './src/index.jsx',
        './lib/index.jsx',
        './index.jsx',
        './src/index.tsx',
    ];
    while (files.length) {
        const file = files.shift();
        if (fs.existsSync(file)) {
            return file;
        }
    }
    return undefined;
}

const run = command => execSync(command).toString().trim();

const gitCommitHash = run('git rev-parse --short HEAD');
const gitAnyLocalModifications = run('git status --porcelain') !== '';

module.exports = {
    mode: nodeEnv,
    devtool: isProd ? 'hidden-source-map' : 'inline-cheap-source-map',
    entry: findEntryPoint(),
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
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify(nodeEnv),
                GIT_COMMIT_HASH: JSON.stringify(gitCommitHash),
                GIT_ANY_LOCAL_MODIFICATIONS: gitAnyLocalModifications,
            },
        }),
        new ESLintPlugin({
            extensions: ['ts', 'tsx', 'js', 'jsx'],
            overrideConfigFile: eslintConfig(),
        }),
    ],
    target: 'electron-renderer',
    externals: createExternals(),
};
