/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const fs = require('fs');
const path = require('path');

let configFileSource = path.join(
    'node_modules',
    'pc-nrfconnect-shared',
    'config',
    'eslintrc.json'
);
let configFileDestination = path.join('.eslintrc');

fs.copyFile(configFileSource, configFileDestination, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log('.eslintrc is updated according to pc-nrfconnect-shared');
});

configFileSource = path.join(
    'node_modules',
    'pc-nrfconnect-shared',
    'config',
    'prettier.config.js'
);
configFileDestination = path.join('prettier.config.js');

fs.copyFile(configFileSource, configFileDestination, err => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(
        'prettier.config.js is updated according to pc-nrfconnect-shared'
    );
});
