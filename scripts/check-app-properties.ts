#!/usr/bin/env ts-node

/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { execSync } from 'child_process';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { z } from 'zod';

import { PackageJson, PackageJsonSchema } from '../ipc/MetaFiles';

const getGitUrlSchema = () => {
    if (!existsSync('./.git')) {
        return z.string();
    }

    const stripped = (gitUrl: string) =>
        gitUrl
            .replace(/\.git$/, '')
            .replace(/^git@github\.com:/, 'github.com')
            .replace(/^https:\/\//, '');

    const remoteGitUrl = z.string().parse(
        execSync('git remote get-url origin', {
            encoding: 'utf-8',
        }).trimEnd()
    );

    return z.string().refine(
        url => stripped(url) === stripped(remoteGitUrl),
        url => ({
            message: `package.json says the repository is located at \`${url}\` but \`git remote get-url origin\` says it is at \`${remoteGitUrl}\`.`,
        })
    );
};

const getFilesSchema = () =>
    z.array(z.string()).superRefine((files, ctx) => {
        const format = (strings: string[]) =>
            strings.map(string => `\`${string}\``).join(', ');

        const missingFileEntries = ['LICENSE', 'dist/', 'Changelog.md'].filter(
            file => !files.includes(file)
        );
        if (missingFileEntries.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `These entries are missing in the property ${'`files`'} in package.json: ${format(
                    missingFileEntries
                )}`,
            });
        }

        const anyRequiredEntries = [
            'resources/*',
            'resources/icon.*',
            'resources/',
        ];
        if (!files.some(entry => anyRequiredEntries.includes(entry))) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `One of these entries must be in the property ${'`files`'} in package.json: ${format(
                    anyRequiredEntries
                )}`,
            });
        }

        const resourceDir = './resources';
        try {
            const resourceFiles = readdirSync(resourceDir);
            const missingResourceFiles = [
                'icon.svg',
                'icon.icns',
                'icon.ico',
                'icon.png',
            ].filter(file => !resourceFiles.includes(file));
            if (missingResourceFiles.length) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: `In the directory \`${resourceDir}\` these files are missing: ${format(
                        missingResourceFiles
                    )}`,
                });
            }
        } catch (error) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Unable to read directory \`${resourceDir}\``,
            });
        }
    });

const getChangelog = () => readFileSync('./Changelog.md', 'utf8');
const changelogEntryRegexp = (version?: string) =>
    new RegExp(`^## ${version}`, 'mi');
const getVersionSchema = (
    packageJson: PackageJson,
    checkChangelogHasCurrentEntry: boolean
) => {
    if (!checkChangelogHasCurrentEntry) {
        return z.string();
    }

    return z
        .string()
        .refine(
            () => existsSync('./Changelog.md'),
            'The mandatory `Changelog.md` is missing.'
        )
        .refine(
            version => getChangelog().match(changelogEntryRegexp(version)),
            `Found no entry for the current version ${packageJson.version} in \`Changelog.md\`.`
        )
        .refine(
            () => !getChangelog().match(changelogEntryRegexp('unreleased')),
            'There must not be an entry `unreleased` in `Changelog.md`.'
        );
};

const validatePackageJson = (checkChangelogHasCurrentEntry: boolean) => {
    const packageJson = <PackageJson>(
        JSON.parse(readFileSync('./package.json', 'utf8'))
    );

    const newPackageJson = PackageJsonSchema.extend({
        repository: z.object({
            type: z.literal('git'),
            url: getGitUrlSchema(),
        }),
        files: getFilesSchema(),
        version: getVersionSchema(packageJson, checkChangelogHasCurrentEntry),
    });

    const result = newPackageJson.safeParse(packageJson);
    if (!result.success) {
        console.error(result.error.flatten());
        process.exit(1);
    }
};

const isRanAsAScript = require.main === module; // https://nodejs.org/docs/latest/api/modules.html#accessing-the-main-module
if (isRanAsAScript) {
    validatePackageJson(false);
}

export default validatePackageJson;
