/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable global-require -- to enable conditional loading of the webpack config */

'use strict';

const path = require('path');
const webpack = require('webpack');

const getConfig = () => {
    try {
        // Using custom webpack.config.js if it exists in project
        return require(path.join(process.cwd(), './webpack.config.js'));
    } catch (err) {
        return require('../config/webpack.config.js');
    }
};

const handleOutput = (err, stats) => {
    if (err) {
        console.error(err.stack || err);
        if (err.details) {
            console.error(err.details);
        }
        return;
    }

    const info = stats.toJson();

    if (stats.hasErrors()) {
        console.error(info.errors);
    }

    if (stats.hasWarnings()) {
        console.warn(info.warnings);
    }

    console.log(
        stats.toString({
            chunks: false, // Makes the build much quieter
            colors: true, //  Shows colors in the console
        })
    );

    process.exitCode = stats.hasErrors() ? 1 : 0;
};

const args = process.argv.slice(2);
if (args[0] === '--watch') {
    webpack(getConfig()).watch({}, handleOutput);
} else if (args[0] === '--dev') {
    process.env.NODE_ENV = 'development';
    webpack(getConfig()).run(handleOutput);
} else if (args[0] === '--prod') {
    process.env.NODE_ENV = 'production';
    webpack(getConfig()).run(handleOutput);
} else {
    console.error('Please specify one of --watch, --dev, or --prod');
    process.exit(1);
}
