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

import { AppInfo, SourceJson } from '../ipc/MetaFiles';
import { PackageJsonApp } from '../ipc/schema/packageJson';
import checkAppProperties from './check-app-properties';

interface App {
    filename: string;
    name: string;
    version: string;
    shasum: string;
    sourceUrl: string;
    appInfoName: string;
    releaseNotesFilename: string;
    iconFilename: string;
    isOfficial: boolean;
    packageJson: PackageJsonApp;
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
    doCreateSource: boolean;
    deployOfficial: boolean;
    sourceDir: string;
    sourceUrl: string;
    sourceName?: string;
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
        .option(
            '--create-source <source name>',
            'Do not fail if the source specifiec with --source does not yet ' +
                'exist but instead create a new source with this name ' +
                '(e.g. "Release Test").'
        )
        .parse();

    const options = program.opts();

    const deployOfficial = options.source === 'official';

    return {
        doPack: options.pack,
        doCreateSource: options.createSource != null,
        sourceName: options.createSource,
        deployOfficial,
        sourceDir: getSourceDir(deployOfficial, options.source),
        sourceUrl: getSourceUrl(deployOfficial, options.source),
    };
};

const readPackageJson = (): PackageJsonApp =>
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
        appInfoName: `${name}.json`,
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

const createSourceDirectory = (dir: string) =>
    new Promise<void>((resolve, reject) => {
        console.log(`Creating source directory ${dir}`);
        client.mkdir(dir, true, err => {
            if (err) {
                reject(new Error(`Failed to create source directory.`));
            } else {
                resolve();
            }
        });
    });

const changeWorkingDirectory = (dir: string) =>
    new Promise<void>((resolve, reject) => {
        console.log(`Changing to directory ${dir}`);
        client.cwd(dir, err => {
            if (err) {
                reject(
                    new Error(
                        '\nError: Failed to change to directory. ' +
                            'Check whether it exists on the FTP server.\n' +
                            'If you want to create a new source, use the ' +
                            '--create-source option.'
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

const assertAppVersionIsValid = (
    latestAppVersion: string | undefined,
    app: App
) => {
    if (latestAppVersion != null) {
        console.log(`Latest published version ${latestAppVersion}`);

        if (semver.lte(app.version, latestAppVersion) && app.isOfficial) {
            throw new Error(
                'Current package version cannot be published, bump it higher'
            );
        }
    }
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

const createBlankSourceJson = async (name: string) => {
    try {
        await downloadFileContent('source.json');
    } catch {
        // Expected that the download throws an exception,
        // because the file is supposed to not exist yet
        return {
            name,
            apps: [],
        };
    }

    throw new Error(
        '`--create-source` given, but a `source.json` already exists on the server.'
    );
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

const getUpdatedSourceJson = async (
    app: App,
    options: Options
): Promise<SourceJson> => {
    const sourceJson = await (options.doCreateSource
        ? createBlankSourceJson(options.sourceName!) // eslint-disable-line @typescript-eslint/no-non-null-assertion -- Can never be null because of the control flow
        : downloadSourceJson());
    return {
        name: sourceJson.name,
        apps: [
            ...new Set(sourceJson.apps).add(
                `${app.sourceUrl}/${app.appInfoName}`
            ),
        ].sort(),
    };
};

const downloadExistingAppInfo = async (
    app: App
): Promise<Partial<Pick<AppInfo, 'latestVersion' | 'versions'>>> => {
    try {
        const appInfoContent = await downloadFileContent(app.appInfoName);
        return JSON.parse(appInfoContent) as AppInfo;
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

const getUpdatedAppInfo = async (app: App): Promise<AppInfo> => {
    const oldAppInfo = await downloadExistingAppInfo(app);

    assertAppVersionIsValid(oldAppInfo.latestVersion, app);

    const {
        name,
        displayName,
        description,
        homepage,
        version,
        nrfConnectForDesktop,
    } = app.packageJson;

    const nrfutilModules = nrfConnectForDesktop?.nrfutil;

    return {
        name,
        displayName: displayName ?? failBecauseOfMissingProperty(),
        description: description ?? failBecauseOfMissingProperty(),
        homepage,
        iconUrl: `${app.sourceUrl}/${app.iconFilename}`,
        releaseNotesUrl: `${app.sourceUrl}/${app.releaseNotesFilename}`,
        latestVersion: version,
        versions: {
            ...oldAppInfo.versions,
            [version]: {
                tarballUrl: `${app.sourceUrl}/${app.filename}`,
                publishTimestamp: new Date().toISOString(),
                shasum: app.shasum,
                nrfutilModules,
            },
        },
    };
};

const uploadSourceJson = (sourceJson: SourceJson) =>
    uploadFile(
        Buffer.from(JSON.stringify(sourceJson, undefined, 2)),
        'source.json'
    );

const uploadAppInfo = (app: App, appInfo: AppInfo) =>
    uploadFile(
        Buffer.from(JSON.stringify(appInfo, undefined, 2)),
        app.appInfoName
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
        if (options.doCreateSource) {
            await createSourceDirectory(options.sourceDir);
        }
        await changeWorkingDirectory(options.sourceDir);

        const sourceJson = await getUpdatedSourceJson(app, options);
        const appInfo = await getUpdatedAppInfo(app);

        await uploadChangelog(app);
        await uploadIcon(app);
        await uploadPackage(app);
        await uploadAppInfo(app, appInfo);
        await uploadSourceJson(sourceJson);

        console.log('Done');
    } catch (error) {
        console.error(errorAsString(error));
        process.exitCode = 1;
    }

    client.end();
};

main();
