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

interface App {
    filename: string;
    name: string;
    version: string;
    shasum: string;
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

const parsePackageFileName = (filename: string) => {
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

const packOrReadPackage = async () => {
    const filename = options.pack ? packPackage() : readPackage();
    const { name, version } = parsePackageFileName(filename);
    const shasum = await getShasum(filename);

    console.log(`Package name: ${name} version: ${version}`);

    return { filename, name, version, shasum };
};

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

const changeWorkingDirectory = (dir: string) =>
    new Promise<void>((resolve, reject) => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => (err ? reject(err) : resolve()));
    });

const downloadFileContent = (filename: string) =>
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

const downloadAppInfo = async (name: string): Promise<AppInfo> => {
    try {
        const content = await downloadFileContent(name);
        return JSON.parse(content);
    } catch (error) {
        console.log(
            `App info file will be created from scratch due to: ${
                (error as any).message // eslint-disable-line @typescript-eslint/no-explicit-any
            }`
        );
        return {};
    }
};

const updateLocalAppInfo = (
    appInfo: AppInfo,
    app: {
        filename: string;
        version: string;
        shasum: string;
    }
) => {
    const latest = appInfo['dist-tags']?.latest;
    if (latest != null) {
        console.log(`Latest published version ${latest}`);

        if (semver.lte(app.version, latest) && !nonOffcialSource) {
            throw new Error(
                'Current package version cannot be published, bump it higher'
            );
        }
    }

    return {
        ...appInfo,
        'dist-tags': {
            ...appInfo['dist-tags'],
            latest: app.version,
        },
        versions: {
            ...appInfo.versions,
            [app.version]: {
                dist: {
                    tarball: `${repoUrl}/${app.filename}`,
                    shasum: app.shasum,
                },
            },
        },
    };
};

const updateAppInfoOnServer = async (app: App) => {
    const appInfo = await downloadAppInfo(app.name);
    const updatedAppInfo = updateLocalAppInfo(appInfo, app);

    await uploadFile(Buffer.from(JSON.stringify(updatedAppInfo)), app.name);
};

type UploadLocalFile = (localFileName: string, remote: string) => Promise<void>;
type UploadBufferContent = (content: Buffer, remote: string) => Promise<void>;

const uploadFile: UploadLocalFile & UploadBufferContent = (
    local: string | Buffer,
    remote: string
) =>
    new Promise<void>((resolve, reject) => {
        console.log(`Uploading file ${remote}`);
        client.put(local, remote, err => (err ? reject(err) : resolve()));
    });

const uploadChangelog = (packageName: string) => {
    const changelogFilename = 'Changelog.md';
    if (!fs.existsSync(changelogFilename)) {
        const errorMsg = `There should be a changelog called "${changelogFilename}". Please provide it!`;
        console.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }

    return uploadFile(changelogFilename, `${packageName}-${changelogFilename}`);
};

const main = async () => {
    checkAppProperties({
        checkChangelogHasCurrentEntry: deployOfficial,
    });

    const app = await packOrReadPackage();

    await connect();
    await changeWorkingDirectory(repoDir);

    try {
        await updateAppInfoOnServer(app);
        await uploadFile(app.filename, app.filename);
        await uploadChangelog(app.name);

        console.log('Done');
    } catch (error) {
        console.error((error as any).message); // eslint-disable-line @typescript-eslint/no-explicit-any
        process.exit(1);
    }

    client.end();
};

main();
