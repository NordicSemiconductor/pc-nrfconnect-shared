#!/usr/bin/env node
"use strict";
/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const commander_1 = __importDefault(require("commander"));
const fs_1 = __importDefault(require("fs"));
const ftp_1 = __importDefault(require("ftp"));
const semver_1 = __importDefault(require("semver"));
const shasum_1 = __importDefault(require("shasum"));
commander_1.default.description('Publish to nordic repository')
    .requiredOption('-s, --source [source]', 'Specify the source to publish (e.g. official).')
    .option('-n, --no-pack', 'Publish existing .tgz file at the root directory without npm pack.')
    .parse(process.argv);
/*
 * To specify the source to publish to
 */
if (!commander_1.default.source) {
    console.error('Source to publish to is not specified.');
    process.exit(1);
}
const nonOffcialSource = commander_1.default.source !== 'official' ? commander_1.default.source : undefined;
/*
 * To use this script REPO_HOST, REPO_USER and REPO_PASS will need to be set
 */
const config = {
    host: process.env.REPO_HOST || 'localhost',
    port: Number(process.env.REPO_PORT) || 21,
    user: process.env.REPO_USER || 'anonymous',
    password: process.env.REPO_PASS || 'anonymous@',
};
const repoDirOfficial = '.pc-tools/nrfconnect-apps';
const repoDirNonOfficial = nonOffcialSource
    ? `${repoDirOfficial}/${nonOffcialSource}`
    : undefined;
const repoDir = `/${process.env.REPO_DIR || repoDirNonOfficial || repoDirOfficial}`;
const repoUrlOfficial = 'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps';
const repoUrlNonOfficial = nonOffcialSource
    ? `${repoUrlOfficial}/${nonOffcialSource}`
    : undefined;
const repoUrl = process.env.REPO_URL || repoUrlNonOfficial || repoUrlOfficial;
const client = new ftp_1.default();
/**
 * Parse npm package name and version from filename
 *
 * @param {string} filename of package
 * @returns {object} parsed package info: { name, version, filename }
 */
function parsePackageName(filename) {
    const rx = /(.*?)-(\d+\.\d+.*?)(.tgz)/;
    const match = rx.exec(filename);
    if (!match) {
        throw new Error(`Couldn't parse filename ${filename}, expected [package-name]-[x.y...].tgz`);
    }
    const [, name, version] = match;
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
 * @param {string} dir the directory to change to
 * @returns {Promise<undefined>} resolves upon success
 */
function changeWorkingDirectory(dir) {
    return new Promise((resolve, reject) => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => (err ? reject(err) : resolve()));
    });
}
/**
 * Download file _filename_ from ftp server current working directory
 *
 * @param {string} filename the file to download
 * @returns {Promise<string>} resolves with content of file
 */
function getFile(filename) {
    return new Promise((resolve, reject) => {
        console.log(`Downloading file ${filename}`);
        let data = '';
        client.get(filename, (err, stream) => {
            if (err)
                return reject(err);
            stream.once('close', () => resolve(data));
            stream.on('data', chunk => {
                data += chunk;
            });
            return undefined;
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
    });
}
/**
 * Calculate SHASUM checksum of file
 *
 * @param {string} filePath of package
 * @returns {Promise<string>} resolves with SHASUM
 */
function getShasum(filePath) {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(filePath, (err, buffer) => {
            if (err) {
                reject(new Error(`Unable to read file when verifying shasum: ${filePath}`));
            }
            else {
                resolve((0, shasum_1.default)(buffer));
            }
        });
    });
}
function uploadChangelog(packageName) {
    const changelogFilename = 'Changelog.md';
    if (!fs_1.default.existsSync(changelogFilename)) {
        const errorMsg = `There should be a changelog called "${changelogFilename}". Please provide it!`;
        console.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }
    return putFile(changelogFilename, `${packageName}-${changelogFilename}`);
}
let thisPackage;
Promise.resolve()
    .then(() => {
    let filename;
    if (commander_1.default.pack) {
        console.log('Packing current package');
        filename = (0, child_process_1.execSync)('npm pack').toString().trim();
    }
    else {
        const files = fs_1.default.readdirSync('.');
        filename = files.find(f => f.includes('.tgz'));
        if (!filename) {
            console.error('Package to publish is not found');
            process.exit(1);
        }
    }
    thisPackage = parsePackageName(filename);
    console.log(`Package name: ${thisPackage.name} version: ${thisPackage.version}`);
})
    .then(() => getShasum(thisPackage.filename))
    .then(checksum => {
    thisPackage.shasum = checksum;
})
    .then(() => connect())
    .then(() => changeWorkingDirectory(repoDir))
    .then(() => getFile(thisPackage.name))
    .catch(err => {
    console.log(`Meta file will be created from scratch due to: ${err.message}`);
    return '{}';
})
    .then(content => JSON.parse(content))
    .then(meta => {
    meta['dist-tags'] = meta['dist-tags'] || {};
    const { latest } = meta['dist-tags'];
    if (latest) {
        console.log(`Latest published version ${latest}`);
        if (semver_1.default.lte(thisPackage.version, latest) && !nonOffcialSource) {
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
    .then(meta => putFile(Buffer.from(JSON.stringify(meta)), thisPackage.name))
    .then(() => putFile(thisPackage.filename, thisPackage.filename))
    .then(() => uploadChangelog(thisPackage.name))
    .then(() => console.log('Done'))
    .catch(err => {
    console.error(err.message);
    process.exit(1);
})
    .then(() => client.end());
