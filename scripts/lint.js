/* Copyright (c) 2015 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

const path = require('path');
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
    const eslint = path.join('node_modules', '.bin', 'eslint');

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
    "Your project contains TypeScript files (with the file ending .ts or .tsx), so it also must contain a file 'tsconfig.json'.\n";
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

runESLint()
    .then(checkForTsconfigJson)
    .catch(error => process.exit(error));
