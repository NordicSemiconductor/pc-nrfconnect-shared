#!/usr/bin/env ts-node

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import property from 'lodash/property';

import { PackageJson } from '../src/utils/AppTypes';

const format = (strings: string[]) =>
    strings.map(string => `\`${string}\``).join(', ');

const propertyIsMissing = (obj: unknown) => (propertyPath: string) => {
    const value = property(propertyPath)(obj);
    return value == null || value === '';
};

const fail = (message: string) => {
    console.error(message);
    process.exit(1);
};

const warn = (message: string) => {
    console.warn(message);
};

const mustBeEmpty = (array: string[], errorMessage: string) => {
    if (array.length !== 0) {
        fail(`${errorMessage}: ${format(array)}`);
    }
};

const mustContain = (
    existingEntries: readonly string[],
    mandatoryEntries: string[],
    errorMessage: string
) => {
    const missingFileEntries = mandatoryEntries.filter(
        entry => !existingEntries.includes(entry)
    );

    mustBeEmpty(missingFileEntries, errorMessage);
};

const mustContainOneOf = (
    existingEntries: readonly string[],
    oneOfTheseEntriesIsMandatory: string[],
    errorMessage: string
) => {
    if (
        !oneOfTheseEntriesIsMandatory.some(entry =>
            existingEntries.includes(entry)
        )
    ) {
        fail(`${errorMessage}: ${format(oneOfTheseEntriesIsMandatory)}`);
    }
};

const checkMandatoryProperties = (packageJson: PackageJson) => {
    const mandatoryProperties = [
        `name`,
        `version`,
        `description`,
        `displayName`,
        `engines.nrfconnect`,
    ];

    const missingProperties = mandatoryProperties.filter(
        propertyIsMissing(packageJson)
    );

    mustBeEmpty(
        missingProperties,
        'package.json is missing these mandatory properties'
    );
};

const checkOptionalProperties = (packageJson: PackageJson) => {
    if (propertyIsMissing(packageJson)('homepage')) {
        warn('Please provide a property `homepage` in package.json.');
    }

    if (propertyIsMissing(packageJson)('repository.url')) {
        warn('Please provide a property `repository.url` in package.json.');
    } else if (existsSync('./.git')) {
        const realGitUrl = execSync('git remote get-url origin', {
            encoding: 'utf-8',
        }).trimEnd();
        const declaredGitUrl = packageJson.repository?.url;

        const withoutPostfix = (gitUrl?: string) =>
            gitUrl?.replace(/\.git$/, '');

        const withoutProtocol = (gitUrl?: string) =>
            gitUrl
                ?.replace(/^git@github\.com:/, 'github.com/')
                .replace(/^https:\/\//, '');

        const stripped = (gitUrl?: string) =>
            withoutProtocol(withoutPostfix(gitUrl));

        if (stripped(realGitUrl) !== stripped(declaredGitUrl)) {
            fail(
                `package.json says the repository is located at \`${declaredGitUrl}\` but \`git remote get-url origin\` says it is at \`${realGitUrl}\`.`
            );
        }
    }
};

const checkFileProperty = (packageJson: PackageJson) => {
    mustContain(
        packageJson.files ?? [],
        ['LICENSE', 'dist/'],
        'These entries are missing in the property `files` in package.json'
    );

    mustContainOneOf(
        packageJson.files ?? [],
        ['resources/*', 'resources/icon.*', 'resources/'],
        'One of these entries must be in the property `files` in package.json'
    );
};

const changelogEntryRegexp = (version?: string) =>
    new RegExp(`^## ${version}`, 'mi');

const checkChangelog = (
    packageJson: PackageJson,
    checkChangelogHasCurrentEntry: boolean
) => {
    if (!existsSync('./Changelog.md')) {
        fail('The mandatory file `Changelog.md` is missing.');
    }

    if (checkChangelogHasCurrentEntry) {
        if (packageJson.version == null) {
            fail('package.json must specify a `version`.');
        }

        const changelog = readFileSync('./Changelog.md', 'utf8');
        if (!changelog.match(changelogEntryRegexp(packageJson.version))) {
            fail(
                `Found no entry for the current version packageJson.version ${packageJson.version} in \`Changelog.md\`.`
            );
        }

        if (changelog.match(changelogEntryRegexp('unreleased'))) {
            fail('There must not be an entry `unreleased` in `Changelog.md`.');
        }
    }
};

const filesIn = (directory: string) => {
    try {
        return readdirSync(directory);
    } catch (error) {
        fail(`Unable to read directory \`${directory}\`.`);
        // Unreachable, but not understood by Typescript
        throw new Error();
    }
};

const checkMandatoryResources = () => {
    mustContain(
        filesIn('./resources'),
        ['icon.svg', 'icon.icns', 'icon.ico', 'icon.png'],
        'In the directory `resources` these files are missing'
    );
};

const runChecks = ({
    checkChangelogHasCurrentEntry,
}: {
    checkChangelogHasCurrentEntry: boolean;
}) => {
    const packageJson = <PackageJson>(
        JSON.parse(readFileSync('./package.json', 'utf8'))
    );

    checkMandatoryProperties(packageJson);
    checkOptionalProperties(packageJson);
    checkFileProperty(packageJson);
    checkChangelog(packageJson, checkChangelogHasCurrentEntry);
    checkMandatoryResources();
};

const isRanAsAScript = require.main === module; // https://nodejs.org/docs/latest/api/modules.html#accessing-the-main-module
if (isRanAsAScript) {
    runChecks({ checkChangelogHasCurrentEntry: false });
}

export default runChecks;
