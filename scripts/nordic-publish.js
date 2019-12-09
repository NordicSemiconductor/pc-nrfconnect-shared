/* Copyright (c) 2015 - 2018, Nordic Semiconductor ASA
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

const execSync = require('child_process').execSync;
const fs = require('fs');
const semver = require('semver');
const shasum = require('shasum');
const FtpClient = require('ftp');
const args = process.argv.slice(2);
const nonOffcialSource = args[0];

/*
 * To use this script REPO_HOST, REPO_USER and REPO_PASS will need to be set
 */
const config = {
    host: process.env.REPO_HOST || 'localhost',
    port: process.env.REPO_PORT || 21,
    user: process.env.REPO_USER || 'anonymous',
    password: process.env.REPO_PASS || 'anonymous@',
};

const repoDirOfficial = '.pc-tools/nrfconnect-apps';
const repoDirNonOfficial = nonOffcialSource? `${repoDirOfficial}/${nonOffcialSource}` : undefined;
const repoDir = `/${process.env.REPO_DIR || repoDirNonOfficial || repoDirOfficial}`;

const repoUrlOfficial = 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps';
const repoUrlNonOfficial = nonOffcialSource? `${repoUrlOfficial}/${nonOffcialSource}` : undefined;
const repoUrl = process.env.REPO_URL || repoUrlNonOfficial || repoUrlOfficial;

const client = new FtpClient();

/**
 * Parse npm package name and verion from filename
 *
 * @param {string} filename
 * @returns {object} parsed package info: { name, version, filename }
 */
function parsePackageName(filename) {
    const rx = /(.*?)-(\d+\.\d+.*?)(.tgz)/;
    const match = rx.exec(filename);
    if (!match) {
        throw new Error(`Couldn't parse filename ${filename}, expected [package-name]-[x.y...].tgz`);
    }
    const [, name, version, ] = match;
    return { name, version, filename };
}

/**
 * Connect to ftp server
 *
 * @returns {Promise<undefined>} resolves upon success
 */
function connect() {
    return new Promise((resolve, reject) => {
        console.log(`Connecting to ftp://${config.user}@${config.host}:${config.port}`);
        client.once('error', err => {
            client.removeAllListeners('ready');
            reject(err);
        });
        client.once('ready', () => {
            client.removeAllListeners('error');
            resolve();
        });
        client.connect(config);
    });
}

/**
 * Change working directory on ftp server
 *
 * @returns {Promise<undefined>} resolves upon success
 */
function changeWorkingDirectory(dir) {
    return new Promise((resolve, reject) => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => err ? reject(err) : resolve());
    });
}

/**
 * Download file _filename_ from ftp server current working directory
 *
 * @param {string} filename
 * @returns {Promise<string>} resolves with content of file
 */
function getFile(filename) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading file ${filename}`);
        let data = '';
        client.get(filename, (err, stream) => {
            if (err) return reject(err);
            stream.once('close', () => resolve(data));
            stream.on('data', chunk => data += chunk);
        });
    });
}

/**
 * Upload file to ftp server current working directory
 *
 * @param {string|buffer} local filename or content of file to be uploaded
 * @param {string} remote filename
 * @returns {Promise<undefined>} resolves upon success
 */
function putFile(local, remote) {
    return new Promise((resolve, reject) => {
        console.log(`Uploading file ${remote}`);
        client.put(local, remote, err => (err ? reject(err) : resolve()));
    })
}

/**
 * Calculate SHASUM checksum of file
 *
 * @param {string} filePath
 * @returns {Promise<string>} resolves with SHASUM
 */
function getShasum(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                reject(new Error(`Unable to read file when verifying shasum: ${filePath}`));
            } else {
                resolve(shasum(buffer));
            }
        });
    });
}

function uploadChangelog(packageName) {
  const changelogFilename = 'Changelog.md';
  if (fs.existsSync(changelogFilename)) {
    return putFile(changelogFilename, `${packageName}-${changelogFilename}`);
  } else {
    console.warn(`There should be a changelog called "${changelogFilename}". Please provide it!`);
  }
}

let thisPackage;

Promise.resolve()
    .then(() => {
        console.log('Packing current package');
        const filename = execSync('npm pack').toString().trim();
        thisPackage = parsePackageName(filename);

        console.log(`Package name: ${thisPackage.name} version: ${thisPackage.version}`);
    })
    .then(() => getShasum(thisPackage.filename))
    .then(shasum => { thisPackage.shasum = shasum; })
    .then(() => connect())
    .then(() => changeWorkingDirectory(repoDir))
    .then(() => getFile(thisPackage.name))
    .catch(err => {
        console.log(`Meta file will be created from scratch due to: ${err.message}`);
        return "{}";
    })
    .then(content => JSON.parse(content))
    .then(meta => {
        meta['dist-tags'] = meta['dist-tags'] || {};
        const { latest } = meta['dist-tags'];

        if (latest) {
            console.log(`Latest published version ${latest}`);

            if (semver.lte(thisPackage.version, latest)) {
                process.exit(1);
                throw new Error('Current package version cannot be published, bump it higher');
            }
        }

        meta['dist-tags'].latest = thisPackage.version;
        meta.versions = meta.versions || {};
        meta.versions[thisPackage.version] = {
            dist: {
                tarball: `${repoUrl}/${thisPackage.filename}`,
                shasum: thisPackage.shasum,
            },
        };

        return meta;
    })
    .then(meta => putFile(new Buffer(JSON.stringify(meta)), thisPackage.name))
    .then(() => putFile(thisPackage.filename, thisPackage.filename))
    .then(() => uploadChangelog(thisPackage.name))
    .then(() => console.log('Done'))
    .catch(err => console.log(err.message))
    .then(() => client.end());
