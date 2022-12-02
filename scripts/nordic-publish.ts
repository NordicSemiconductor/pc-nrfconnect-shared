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

import { PackageJson } from '../src/utils/AppTypes';
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
    appJsonName: string;
    releaseNotesFilename: string;
    iconFilename: string;
    isOfficial: boolean;
    packageJson: PackageJson;
}

interface SourceJson {
    name: string;
    apps?: string[];
}

interface AppJson {
    name: string;
    displayName: string;
    description: string;
    homepage?: string;
    iconUrl: string;
    releaseNotesUrl: string;
    latest: string;
    versions: {
        [version: string]: {
            shasum: string;
            tarball: string;
        };
    };
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

const readPackageJson = (): PackageJson =>
    JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

const packPackage = () => {
    console.log('Packing current package');
    execSync('npm pack');
};

const ensurePackageExists = (filename: string) => {
    if (!fs.existsSync(filename)) {
        throw new Error(`Package \`${filename}\` to publish is not found`);
    }
};

const getShasum = (filePath: string) => {
    try {
        return calculateShasum(fs.readFileSync(filePath));
    } catch (error) {
        throw new Error(
            `Unable to read file when verifying shasum: ${filePath}. \nError: ${errorAsString(
                error
            )}`
        );
    }
};

const packOrReadPackage = (options: Options): App => {
    const packageJson = readPackageJson();
    const { name, version } = packageJson;
    const filename = `${name}-${version}.tgz`;

    if (options.doPack) {
        packPackage();
    } else {
        ensurePackageExists(filename);
    }
    const shasum = getShasum(filename);

    console.log(`Package name: ${name} version: ${version}`);

    return {
        name,
        version,
        filename,
        shasum,
        sourceUrl: options.sourceUrl,
        isOfficial: options.deployOfficial,
        appJsonName: `${name}.json`,
        releaseNotesFilename: `${name}-Changelog.md`,
        iconFilename: `${name}.svg`,
        packageJson,
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
    new Promise<void>((resolve, reject) => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => {
            if (err) {
                reject(
                    new Error(
                        `Failed to change to directory. Check whether it exists on the FTP server.`
                    )
                );
            } else {
                resolve();
            }
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

const downloadSourceJson = async () => {
    let sourceJsonContent;
    try {
        sourceJsonContent = await downloadFileContent('source.json');
        const sourceJson = <SourceJson>JSON.parse(sourceJsonContent);
        if (
            sourceJson == null ||
            typeof sourceJson !== 'object' ||
            sourceJson.name == null ||
            (sourceJson.apps !== undefined && !Array.isArray(sourceJson.apps))
        ) {
            throw new Error(
                '`source.json` does not have the expected content.'
            );
        }

        return sourceJson;
    } catch (error) {
        const message = 'Unable to read `source.json` on the server.\nError: ';
        const caughtError = errorAsString(error);
        const maybeSourceJsonContent =
            sourceJsonContent == null
                ? ''
                : `Content: \`${sourceJsonContent}\``;

        throw new Error(message + caughtError + maybeSourceJsonContent);
    }
};

const getUpdatedSourceJson = async (app: App): Promise<SourceJson> => {
    const sourceJson = await downloadSourceJson();
    return {
        name: sourceJson.name,
        apps: [
            ...new Set(sourceJson.apps).add(
                `${app.sourceUrl}/${app.appJsonName}`
            ),
        ].sort(),
    };
};

const downloadExistingVersions = async (app: App) => {
    try {
        const appJson = <AppJson>(
            JSON.parse(await downloadFileContent(app.appJsonName))
        );
        return appJson.versions;
    } catch (error) {
        console.log(
            `No previous app versions found due to: ${errorAsString(error)}`
        );

        return {};
    }
};

const failBecauseOfMissingProperty = () => {
    throw new Error(
        'This must never happen, because the properties were already checked before'
    );
};

const getUpdatedAppJson = async (app: App): Promise<AppJson> => {
    const versions = await downloadExistingVersions(app);

    const { name, displayName, description, homepage, version } =
        app.packageJson;

    return {
        name,
        displayName: displayName ?? failBecauseOfMissingProperty(),
        description: description ?? failBecauseOfMissingProperty(),
        homepage,
        iconUrl: `${app.sourceUrl}/${app.iconFilename}`,
        releaseNotesUrl: `${app.sourceUrl}/${app.releaseNotesFilename}`,
        latest: version,
        versions: {
            ...versions,
            [version]: {
                tarball: `${app.sourceUrl}/${app.filename}`,
                shasum: app.shasum,
            },
        },
    };
};

const uploadAppInfo = (app: App, updatedAppInfo: AppInfo) =>
    uploadFile(
        Buffer.from(JSON.stringify(updatedAppInfo, undefined, 2)),
        app.name
    );

const uploadSourceJson = (sourceJson: SourceJson) =>
    uploadFile(
        Buffer.from(JSON.stringify(sourceJson, undefined, 2)),
        'source.json'
    );

const uploadAppJson = (app: App, appJson: AppJson) =>
    uploadFile(
        Buffer.from(JSON.stringify(appJson, undefined, 2)),
        app.appJsonName
    );

const uploadPackage = (app: App) => uploadFile(app.filename, app.filename);

const uploadChangelog = (app: App) => {
    const changelogFilename = 'Changelog.md';
    if (!fs.existsSync(changelogFilename)) {
        const errorMsg = `There should be a changelog called "${changelogFilename}". Please provide it!`;
        return Promise.reject(new Error(errorMsg));
    }

    return uploadFile(changelogFilename, app.releaseNotesFilename);
};

const uploadIcon = (app: App) => {
    const localIconFilename = 'resources/icon.svg';
    if (!fs.existsSync(localIconFilename)) {
        const errorMsg = `There must be an icon called "${localIconFilename}". Please provide it!`;
        return Promise.reject(new Error(errorMsg));
    }

    return uploadFile(localIconFilename, app.iconFilename);
};

const main = async () => {
    try {
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

        const appInfo = await getUpdatedAppInfo(app);
        const sourceJson = await getUpdatedSourceJson(app);
        const appJson = await getUpdatedAppJson(app);

        await uploadChangelog(app);
        await uploadIcon(app);
        await uploadPackage(app);
        await uploadAppInfo(app, appInfo);
        await uploadAppJson(app, appJson);
        await uploadSourceJson(sourceJson);

        console.log('Done');
    } catch (error) {
        console.error(errorAsString(error));
        process.exitCode = 1;
    }

    client.end();
};

main();
