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
    sourceUrl: string;
    isOfficial: boolean;
}

const client = new FtpClient();

const hasMessage = (error: unknown): error is { message: unknown } =>
    error != null && typeof error === 'object' && 'message' in error;

const errorAsString = (error: unknown) =>
    hasMessage(error) ? error.message : String(error);

const getSourceDir = (deployOfficial: boolean, sourceName: string) => {
    const repoDirOfficial = '/.pc-tools/nrfconnect-apps';

    if (process.env.REPO_DIR) return process.env.REPO_DIR;
    if (deployOfficial) return repoDirOfficial;

    return `${repoDirOfficial}/${sourceName}`;
};

const getSourceUrl = (deployOfficial: boolean, sourceName: string) => {
    const repoUrlOfficial =
        'https://developer.nordicsemi.com/.pc-tools/nrfconnect-apps';

    if (process.env.REPO_URL) return process.env.REPO_URL;
    if (deployOfficial) return repoUrlOfficial;

    return `${repoUrlOfficial}/${sourceName}`;
};

interface Options {
    doPack: boolean;
    deployOfficial: boolean;
    sourceDir: string;
    sourceUrl: string;
}

const parseOptions = (): Options => {
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

    return {
        doPack: options.pack,
        deployOfficial,
        sourceDir: getSourceDir(deployOfficial, options.source),
        sourceUrl: getSourceUrl(deployOfficial, options.source),
    };
};

const readPackageJson = () => {
    const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));
    const { name, version } = packageJson;

    return {
        name,
        version,
        filename: `${name}-${version}.tgz`,
    };
};

const packPackage = () => {
    console.log('Packing current package');
    execSync('npm pack');
};

const ensurePackageExists = (filename: string) => {
    if (!fs.existsSync(filename)) {
        console.error(`Package \`${filename}\` to publish is not found`);
        process.exit(1);
    }
};

const getShasum = (filePath: string) => {
    try {
        return calculateShasum(fs.readFileSync(filePath));
    } catch (error) {
        throw new Error(
            `Unable to read file when verifying shasum: ${filePath}`
        );
    }
};

const packOrReadPackage = (options: Options): App => {
    const { name, version, filename } = readPackageJson();
    if (options.doPack) {
        packPackage();
    } else {
        ensurePackageExists(filename);
    }
    const shasum = getShasum(filename);

    console.log(`Package name: ${name} version: ${version}`);

    return {
        filename,
        name,
        version,
        shasum,
        sourceUrl: options.sourceUrl,
        isOfficial: options.deployOfficial,
    };
};

const connect = (config: {
    host: string;
    port: number;
    user: string;
    password: string;
}) =>
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
    new Promise<void>(resolve => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => {
            if (err) {
                console.error(
                    `Failed to change to directory. Check whether it exists on the FTP server.`
                );
                process.exit(1);
            }

            resolve();
        });
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
            `App info file will be created from scratch due to: ${errorAsString(
                error
            )}`
        );
        return {};
    }
};

const updateLocalAppInfo = (appInfo: AppInfo, app: App) => {
    const latest = appInfo['dist-tags']?.latest;
    if (latest != null) {
        console.log(`Latest published version ${latest}`);

        if (semver.lte(app.version, latest) && app.isOfficial) {
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
                    tarball: `${app.sourceUrl}/${app.filename}`,
                    shasum: app.shasum,
                },
            },
        },
    };
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

const getUpdatedAppInfo = async (app: App) => {
    const appInfo = await downloadAppInfo(app.name);
    return updateLocalAppInfo(appInfo, app);
};

const uploadAppInfo = (app: App, updatedAppInfo: AppInfo) =>
    uploadFile(
        Buffer.from(JSON.stringify(updatedAppInfo, undefined, 2)),
        app.name
    );

const uploadPackage = (app: App) => uploadFile(app.filename, app.filename);

const uploadChangelog = (app: App) => {
    const changelogFilename = 'Changelog.md';
    if (!fs.existsSync(changelogFilename)) {
        const errorMsg = `There should be a changelog called "${changelogFilename}". Please provide it!`;
        console.error(errorMsg);
        return Promise.reject(new Error(errorMsg));
    }

    return uploadFile(changelogFilename, `${app.name}-${changelogFilename}`);
};

const main = async () => {
    /*
     * To use this script REPO_HOST, REPO_USER and REPO_PASS will need to be set
     */
    const config = {
        host: process.env.REPO_HOST || 'localhost',
        port: Number(process.env.REPO_PORT) || 21,
        user: process.env.REPO_USER || 'anonymous',
        password: process.env.REPO_PASS || 'anonymous@',
    };

    const options = parseOptions();

    checkAppProperties({
        checkChangelogHasCurrentEntry: options.deployOfficial,
    });

    const app = packOrReadPackage(options);

    await connect(config);
    await changeWorkingDirectory(options.sourceDir);

    try {
        const appInfo = await getUpdatedAppInfo(app);

        await uploadChangelog(app);
        await uploadPackage(app);
        await uploadAppInfo(app, appInfo);

        console.log('Done');
    } catch (error) {
        console.error(errorAsString(error));
        process.exit(1);
    }

    client.end();
};

main();
