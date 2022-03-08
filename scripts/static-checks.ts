#!/usr/bin/env -S ts-node --swc

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn, SpawnOptions } from 'child_process';
import { existsSync } from 'fs';
import klaw from 'klaw';
import { join } from 'path';

const packageJson = require(`${process.cwd()}/package.json`);

const uncancellable = <T>(promise: Promise<T>) => ({
    promise,
    cancel: () => {},
});

const spawnInPromise = (command: string, argv: string[]) => {
    const options: SpawnOptions = {
        env: process.env,
        shell: true,
        stdio: 'inherit',
    };

    const childProcess = spawn(command, argv, options);
    const promise = new Promise<void>((resolve, reject) => {
        childProcess.on('exit', code => {
            if (code !== 0) {
                reject(code);
            } else {
                resolve();
            }
        });
    });

    return { promise, cancel: () => childProcess.kill() };
};

const runESLint = () => {
    const eslint = join('node_modules', '.bin', 'eslint');
    return spawnInPromise(eslint, process.argv.slice(2));
};

const errorForMissingTsconfigJson = 2;
const messageForMissingTsconfigJson =
    'Your project contains TypeScript files (with the file ending .ts ' +
    "or .tsx), so it also must contain a file 'tsconfig.json'.\n";
const checkForTsconfigJson = () =>
    uncancellable(
        new Promise<void>((resolve, reject) => {
            if (existsSync('tsconfig.json')) {
                resolve();
            } else {
                const excludeNodeModules = (path: string) =>
                    !path.endsWith('node_modules');
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
        })
    );

const checkTypeScriptTypes = () => {
    if (existsSync('tsconfig.json')) {
        return spawnInPromise('tsc', ['--noEmit']);
    }
    return uncancellable(Promise.resolve());
};

const checkLicenses = () => {
    if (packageJson.disableLicenseCheck) {
        return uncancellable(Promise.resolve());
    }

    const runningInShared = existsSync('./bin/nrfconnect-license.ts');
    const args: [string, string[]] = runningInShared
        ? ['ts-node', ['--swc', './bin/nrfconnect-license.ts', 'check']]
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
    checks.forEach(check => check.cancel());
    process.exit(error);
});
