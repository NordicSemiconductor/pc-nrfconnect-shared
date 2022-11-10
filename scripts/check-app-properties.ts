#!/usr/bin/env ts-node

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import property from 'lodash/property';

export interface PackageJson {
    files?: string[];
    repository?: {
        type: string;
        url: string;
    };
}

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
    existingEntries: string[],
    mandatoryEntries: string[],
    errorMessage: string
) => {
    const missingFileEntries = mandatoryEntries.filter(
        entry => !existingEntries.includes(entry)
    );

    mustBeEmpty(missingFileEntries, errorMessage);
};

const mustContainOneOf = (
    existingEntries: string[],
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
    } else {
        const realGitUrl = execSync('git remote get-url origin', {
            encoding: 'utf-8',
        }).trimEnd();
        const declaredGitUrl = packageJson.repository?.url;

        const withoutPostfix = (gitUrl?: string) =>
            gitUrl?.replace(/\.git$/, '');

        if (withoutPostfix(realGitUrl) !== withoutPostfix(declaredGitUrl)) {
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

const checkChangelog = () => {
    if (!existsSync('./Changelog.md')) {
        fail('The mandatory file `Changelog.md` is missing.');
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

const runChecks = () => {
    const packageJson = <PackageJson>(
        JSON.parse(readFileSync('./package.json', 'utf8'))
    );

    checkMandatoryProperties(packageJson);
    checkOptionalProperties(packageJson);
    checkFileProperty(packageJson);
    checkChangelog();
    checkMandatoryResources();
};

runChecks();
