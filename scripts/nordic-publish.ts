#!/usr/bin/env ts-node

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { execSync } from 'child_process';
import { program } from 'commander';
import fs from 'fs';
import FtpClient from 'ftp';
import semver from 'semver';
import calculateShasum from 'shasum';

import checkAppProperties from './check-app-properties';

interface AppInfo {
    ['dist-tags']?: {
        latest?: string;
    };
    versions?: {
        [version: string]: {
            dist: {
                tarball: string;
                shasum: string;
            };
        };
    };
}

program
    .description('Publish to nordic repository')
    .requiredOption(
        '-s, --source <source>',
        'Specify the source to publish (e.g. official).'
    )
    .option(
        '-n, --no-pack',
        'Publish existing .tgz file at the root directory without npm pack.'
    )
    .parse();

const options = program.opts();

const deployOfficial = options.source === 'official';
const nonOffcialSource =
    options.source !== 'official' ? options.source : undefined;

/*
 * To use this script REPO_HOST, REPO_USER and REPO_PASS will need to be set
 */
const config = {
    host: process.env.REPO_HOST || 'localhost',
    port: Number(process.env.REPO_PORT) || 21,
    user: process.env.REPO_USER || 'anonymous',
    password: process.env.REPO_PASS || 'anonymous@',
};

const repoDirOfficial = '/.pc-tools/nrfconnect-apps';
const repoDir =
    process.env.REPO_DIR ||
    (deployOfficial
        ? repoDirOfficial
        : `${repoDirOfficial}/${nonOffcialSource}`);

const repoUrlOfficial =
    'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps';
const repoUrl =
    process.env.REPO_URL ||
    (deployOfficial
        ? repoUrlOfficial
        : `${repoUrlOfficial}/${nonOffcialSource}`);

const client = new FtpClient();

/**
 * Parse npm package name and version from filename
 *
 * @param {string} filename of package
 * @returns {object} parsed package info: { name, version, filename }
 */
const parsePackageName = (filename: string) => {
    const rx = /(.*?)-(\d+\.\d+.*?)(.tgz)/;
    const match = rx.exec(filename);
    if (!match) {
        throw new Error(
            `Couldn't parse filename ${filename}, expected [package-name]-[x.y...].tgz`
        );
    }
    const [, name, version] = match;
    return { name, version };
};

/**
 * Connect to ftp server
 *
 * @returns {Promise<undefined>} resolves upon success
 */
const connect = () =>
    new Promise<void>((resolve, reject) => {
        console.log(
            `Connecting to ftp://${config.user}@${config.host}:${config.port}`
        );
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

/**
 * Change working directory on ftp server
 *
 * @param {string} dir the directory to change to
 * @returns {Promise<undefined>} resolves upon success
 */
const changeWorkingDirectory = (dir: string) =>
    new Promise<void>((resolve, reject) => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => (err ? reject(err) : resolve()));
    });

/**
 * Download file _filename_ from ftp server current working directory
 *
 * @param {string} filename the file to download
 * @returns {Promise<string>} resolves with content of file
 */
const getFile = (filename: string) =>
    new Promise<string>((resolve, reject) => {
        console.log(`Downloading file ${filename}`);
        let data = '';
        client.get(filename, (err, stream) => {
            if (err) return reject(err);
            stream.once('close', () => resolve(data));
            stream.on('data', chunk => {
                data += chunk;
            });
            return undefined;
        });
    });

/**
 * Upload file to ftp server current working directory
 *
 * @param {string|buffer} local filename or content of file to be uploaded
 * @param {string} remote filename
 * @returns {Promise<undefined>} resolves upon success
 */
const putFile = (local: string | Buffer, remote: string) =>
    new Promise<void>((resolve, reject) => {
        console.log(`Uploading file ${remote}`);
        client.put(local, remote, err => (err ? reject(err) : resolve()));
    });

const packPackage = () => {
    console.log('Packing current package');
    return execSync('npm pack').toString().trim();
};

const readPackage = () => {
    const files = fs.readdirSync('.');
    const filename = files.find(f => f.includes('.tgz'));
    if (!filename) {
        console.error('Package to publish is not found');
        process.exit(1);
    }

    return filename;
};

const packOrReadPackage = () => {
    const filename = options.pack ? packPackage() : readPackage();
    const { name, version } = parsePackageName(filename);

    console.log(`Package name: ${name} version: ${version}`);

    return { filename, name, version };
};

/**
 * Calculate SHASUM checksum of file
 *
 * @param {string} filePath of package
 * @returns {Promise<string>} resolves with SHASUM
 */
const getShasum = (filePath: string) =>
    new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, (err, buffer) => {
            if (err) {
                reject(
                    new Error(
                        `Unable to read file when verifying shasum: ${filePath}`
                    )
                );
            } else {
                resolve(calculateShasum(buffer));
            }
        });
    });

const uploadChangelog = (packageName: string) => {
    const changelogFilename = 'Changelog.md';
    if (!fs.existsSync(changelogFilename)) {
        const errorMsg = `There should be a changelog called "${changelogFilename}". Please provide it!`;
        console.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }

    return putFile(changelogFilename, `${packageName}-${changelogFilename}`);
};

const main = async () => {
    checkAppProperties({
        checkChangelogHasCurrentEntry: deployOfficial,
    });

    const { filename, name, version } = packOrReadPackage();
    const shasum = await getShasum(filename);

    await connect();
    await changeWorkingDirectory(repoDir);

    // get App info
    let meta: AppInfo = {};
    try {
        const content = await getFile(name);
        meta = JSON.parse(content);
    } catch (error) {
        console.log(
            `Meta file will be created from scratch due to: ${
                (error as any).message // eslint-disable-line @typescript-eslint/no-explicit-any
            }`
        );
    }

    try {
        // update App info file
        meta['dist-tags'] = meta['dist-tags'] || {};
        const { latest } = meta['dist-tags'];

        if (latest) {
            console.log(`Latest published version ${latest}`);

            if (semver.lte(version, latest) && !nonOffcialSource) {
                throw new Error(
                    'Current package version cannot be published, bump it higher'
                );
            }
        }

        meta['dist-tags'].latest = version;
        meta.versions = meta.versions || {};
        meta.versions[version] = {
            dist: {
                tarball: `${repoUrl}/${filename}`,
                shasum,
            },
        };

        // upload
        await putFile(Buffer.from(JSON.stringify(meta)), name);
        await putFile(filename, filename);
        await uploadChangelog(name);

        console.log('Done');
    } catch (error) {
        console.error((error as any).message); // eslint-disable-line @typescript-eslint/no-explicit-any
        process.exit(1);
    }

    client.end();
};

main();
