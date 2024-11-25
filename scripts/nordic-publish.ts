#!/usr/bin/env ts-node

/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable max-classes-per-file, class-methods-use-this */

import { execSync } from 'child_process';
import { program } from 'commander';
import fs from 'fs';
import LowlevelFtpClient from 'ftp';
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

let client: Client;

abstract class Client {
    abstract sourceUrl: string;

    initialise(options: Options): Promise<void> | void {} // eslint-disable-line @typescript-eslint/no-unused-vars
    end(): void {}

    abstract download(filename: string): Promise<string>;
    abstract uploadContent(
        content: Buffer,
        remoteFilename: string
    ): Promise<void>;
    abstract uploadLocalFile(
        localFilename: string,
        remoteFilename: string
    ): Promise<void>;
}

class FtpClient extends Client {
    /*
     * To use this script with an FTP server REPO_HOST, REPO_USER and REPO_PASS need to be set
     */

    ftpClient = new LowlevelFtpClient();

    host = process.env.REPO_HOST || 'localhost';
    port = Number(process.env.REPO_PORT) || 21;
    user = process.env.REPO_USER || 'anonymous';
    password = process.env.REPO_PASS || 'anonymous@';

    sourceDir: string;
    sourceUrl: string;

    constructor(private readonly options: Options) {
        super();
        this.sourceDir = this.getSourceDir();
        this.sourceUrl = this.getSourceUrl();
    }

    getSourceDir = () => {
        const repoDirOfficial = '/.pc-tools/nrfconnect-apps';

        if (process.env.REPO_DIR) return process.env.REPO_DIR;
        if (this.options.deployOfficial) return repoDirOfficial;

        return `${repoDirOfficial}/${this.options.source}`;
    };

    getSourceUrl = () => {
        if (process.env.REPO_URL) return process.env.REPO_URL;
        return `https://developer.nordicsemi.com${this.sourceDir}`;
    };

    connect = () =>
        new Promise<void>((resolve, reject) => {
            console.log(
                `Connecting to ftp://${this.user}@${this.host}:${this.port}`
            );
            this.ftpClient.once('error', err => {
                this.ftpClient.removeAllListeners('ready');
                reject(err);
            });
            this.ftpClient.once('ready', () => {
                this.ftpClient.removeAllListeners('error');
                resolve();
            });
            this.ftpClient.connect({
                host: this.host,
                port: this.port,
                user: this.user,
                password: this.password,
            });
        });

    createSourceDirectory = () =>
        new Promise<void>((resolve, reject) => {
            console.log(`Creating source directory ${this.sourceDir}`);
            this.ftpClient.mkdir(this.sourceDir, true, err => {
                if (err) {
                    reject(new Error(`Failed to create source directory.`));
                } else {
                    resolve();
                }
            });
        });

    changeWorkingDirectory = () =>
        new Promise<void>((resolve, reject) => {
            console.log(`Changing to directory ${this.sourceDir}`);
            this.ftpClient.cwd(this.sourceDir, err => {
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

    initialise = async () => {
        await this.connect();
        if (this.options.doCreateSource) {
            await this.createSourceDirectory();
        }
        await this.changeWorkingDirectory();
    };

    download = (filename: string) =>
        new Promise<string>((resolve, reject) => {
            console.log(`Downloading file ${filename}`);
            let data = '';
            this.ftpClient.get(filename, (err, stream) => {
                if (err) return reject(err);
                stream.once('close', () => resolve(data));
                stream.on('data', chunk => {
                    data += chunk;
                });
                return undefined;
            });
        });

    upload = (
        contentOrLocalFilename: string | Buffer,
        remoteFilename: string
    ) =>
        new Promise<void>((resolve, reject) => {
            console.log(`Uploading file ${remoteFilename}`);
            this.ftpClient.put(contentOrLocalFilename, remoteFilename, err =>
                err ? reject(err) : resolve()
            );
        });

    uploadContent = this.upload;
    uploadLocalFile = this.upload;

    end = () => this.ftpClient.end();
}

const hasMessage = (error: unknown): error is { message: unknown } =>
    error != null && typeof error === 'object' && 'message' in error;

const errorAsString = (error: unknown) =>
    hasMessage(error) ? error.message : String(error);

interface Options {
    doPack: boolean;
    doCreateSource: boolean;
    deployOfficial: boolean;
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
        sourceUrl: client.sourceUrl,
        isOfficial: options.deployOfficial,
        appInfoName: `${name}.json`,
        releaseNotesFilename: `${name}-Changelog.md`,
        iconFilename: `${name}.svg`,
        packageJson,
    };
};

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

const createBlankSourceJson = async (name: string) => {
    try {
        await client.download('source.json');
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
        sourceJsonContent = await client.download('source.json');
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
        const appInfoContent = await client.download(app.appInfoName);
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
    client.uploadContent(
        Buffer.from(JSON.stringify(sourceJson, undefined, 2)),
        'source.json'
    );

const uploadAppInfo = (app: App, appInfo: AppInfo) =>
    client.uploadContent(
        Buffer.from(JSON.stringify(appInfo, undefined, 2)),
        app.appInfoName
    );

const uploadPackage = (app: App) =>
    client.uploadLocalFile(app.filename, app.filename);

const uploadChangelog = (app: App) => {
    const changelogFilename = 'Changelog.md';
    if (!fs.existsSync(changelogFilename)) {
        const errorMsg = `There should be a changelog called "${changelogFilename}". Please provide it!`;
        return Promise.reject(new Error(errorMsg));
    }

    return client.uploadLocalFile(changelogFilename, app.releaseNotesFilename);
};

const uploadIcon = (app: App) => {
    const localIconFilename = 'resources/icon.svg';
    if (!fs.existsSync(localIconFilename)) {
        const errorMsg = `There must be an icon called "${localIconFilename}". Please provide it!`;
        return Promise.reject(new Error(errorMsg));
    }

    return client.uploadLocalFile(localIconFilename, app.iconFilename);
};

const main = async () => {
    try {
        const options = parseOptions();

        client = new FtpClient(options);

        checkAppProperties({
            checkChangelogHasCurrentEntry: options.deployOfficial,
        });

        const app = packOrReadPackage(options);

        await client.initialise(options);

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

    client?.end();
};

main();
