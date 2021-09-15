/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const jest = require('jest');

let configFile;
try {
    // Using custom jest.config.json if it exists in project
    configFile = require.resolve('../../../jest.config.json');
} catch (err) {
    configFile = require.resolve('../config/jest.config.json');
}

const argv = process.argv.slice(2);
argv.unshift('--config', configFile);

jest.run(argv);
