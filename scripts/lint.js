/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

'use strict';

const { join } = require('path');
const { spawn } = require('child_process');
const { existsSync } = require('fs');
const klaw = require('klaw');

const spawnInPromise = (command, argv) => {
    const options = {
        env: process.env,
        shell: true,
        stdio: 'inherit',
    };

    return new Promise((resolve, reject) => {
        spawn(command, argv, options).on('exit', code => {
            if (code !== 0) {
                reject(code);
            } else {
                resolve();
            }
        });
    });
};

const runESLint = () => {
    const eslint = join('node_modules', '.bin', 'eslint');

    let configFile;
    try {
        // Using custom .eslintrc if it exists in project
        configFile = require.resolve('../../../.eslintrc');
    } catch (err) {
        configFile = require.resolve('../config/eslintrc.json');
    }

    const argv = process.argv.slice(2);
    argv.unshift('--ext', 'js,jsx,ts,tsx');
    argv.unshift('--config', configFile);

    return spawnInPromise(eslint, argv);
};

const errorForMissingTsconfigJson = 2;
const messageForMissingTsconfigJson =
    'Your project contains TypeScript files (with the file ending .ts ' +
    "or .tsx), so it also must contain a file 'tsconfig.json'.\n";
const checkForTsconfigJson = () =>
    new Promise((resolve, reject) => {
        if (existsSync('tsconfig.json')) {
            resolve();
        } else {
            const excludeNodeModules = path => !path.endsWith('node_modules');
            klaw('.', { filter: excludeNodeModules })
                .on('data', ({ path }) => {
                    if (path.endsWith('.ts') || path.endsWith('.tsx')) {
                        console.log(messageForMissingTsconfigJson);
                        reject(errorForMissingTsconfigJson);
                    }
                })
                .on('end', () => {
                    resolve();
                });
        }
    });

const checkTypeScriptTypes = () => {
    if (existsSync('tsconfig.json')) {
        return spawnInPromise('tsc', ['--noEmit']);
    }
    return undefined;
};

Promise.all([
    runESLint(),
    checkForTsconfigJson(),
    checkTypeScriptTypes(),
]).catch(error => process.exit(error));
