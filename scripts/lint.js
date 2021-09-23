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

const packageJson = require(`${process.cwd()}/package.json`);

const spawnInPromise = (command, argv) => {
    const options = {
        env: process.env,
        shell: true,
        stdio: 'inherit',
    };

    const childProcess = spawn(command, argv, options);
    const promise = new Promise((resolve, reject) => {
        childProcess.on('exit', code => {
            if (code !== 0) {
                reject(code);
            } else {
                resolve();
            }
        });
    });

    return { promise, terminator: () => childProcess.kill() };
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
const checkForTsconfigJson = () => ({
    terminator: () => {},
    promise: new Promise((resolve, reject) => {
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
    }),
});

const checkTypeScriptTypes = () => {
    if (existsSync('tsconfig.json')) {
        return spawnInPromise('tsc', ['--noEmit']);
    }
    return { promise: undefined, terminator: () => {} };
};

const checkLicenses = () => {
    if (packageJson.disableLicenseCheck) {
        return Promise.resolve();
    }

    const runningInShared = existsSync('./bin/nrfconnect-license.mjs');
    const args = runningInShared
        ? ['node', ['./bin/nrfconnect-license.mjs', 'check']]
        : ['nrfconnect-license', ['check']];

    return spawnInPromise(...args);
};

const checks = [
    runESLint(),
    checkForTsconfigJson(),
    checkTypeScriptTypes(),
    checkLicenses(),
];

Promise.all(checks.map(check => check.promise)).catch(error => {
    checks.forEach(check => check.terminator());
    process.exit(error);
});
