/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import path from 'path';
import webpack from 'webpack';

const configFile =
    [
        path.join(process.cwd(), './webpack.config.js'),
        path.join(process.cwd(), './webpack.config.ts'),
    ].find(fs.existsSync) ?? '../config/webpack.config.ts';
const configFileContent = require(configFile);
const config = configFileContent.default ?? configFileContent;

type WebpackError = Error & {
    details?: unknown;
};

type WebpackStats = {
    hasWarnings(): boolean;
    hasErrors(): boolean;
    toJson(options?: string): unknown;
    toString(options?: unknown): string;
};

const handleOutput = (err?: null | WebpackError, stats?: WebpackStats) => {
    if (err) {
        console.error(err.stack || err);
        if (err.details) {
            console.error(err.details);
        }
        return;
    }

    if (stats == null) {
        console.error('Stats must be set if err is unset.');
        return;
    }

    const info = stats.toJson() as { errors: unknown; warnings: unknown };

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
    webpack(config).watch({}, handleOutput);
} else if (args[0] === '--dev') {
    process.env.NODE_ENV = 'development';
    webpack(config).run(handleOutput);
} else if (args[0] === '--prod') {
    process.env.NODE_ENV = 'production';
    webpack(config).run(handleOutput);
} else {
    console.error('Please specify one of --watch, --dev, or --prod');
    process.exit(1);
}
