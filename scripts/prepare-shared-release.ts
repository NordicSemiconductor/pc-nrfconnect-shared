#!/usr/bin/env ts-node

/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/*
  A script to prepare a new version of shared.

  Requirement for this script: Have [the GitHub CLI tool `gh`](https://cli.github.com)
  installed and authenticate in it (run `gh auth login`).

  Run
     npm run prepare-shared-release
  to update the version in `package.json` and the header of the latest entry
  in `Changelog.md`.
*/
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

import { getNextReleaseNumber } from './release-shared';

const parseJson = <Result>(jsonString: string) =>
    JSON.parse(jsonString) as Result;

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const npm = (...commands: string[]) =>
    spawnSync(npmCommand, commands, {
        stdio: ['inherit', 'pipe', 'inherit'],
        encoding: 'utf-8',
    }).stdout;

const updatePackageJson = (nextReleaseNumber: number) => {
    const nextVersionString = `${nextReleaseNumber}.0.0`;
    const currentVersion = parseJson<string>(npm('pkg', 'get', 'version'));

    if (nextVersionString === currentVersion) {
        console.log(
            `- The version in \`package.json\` is already \`${currentVersion}\`, no need to change it.`
        );
        return false;
    }

    npm('pkg', 'set', `version=${nextVersionString}`);
    console.log(
        `- Updated the version in \`package.json\` to \`${nextVersionString}\`.`
    );

    return true;
};

const withoutTime = (date: Date) => date.toISOString().split('T')[0];

const updateChangelog = (nextReleaseNumber: string) => {
    const changelog = readFileSync('Changelog.md', { encoding: 'utf-8' });

    const match = changelog.match(
        /(?<beginning>.*?)^## (?<header>.*?)$(?<ending>.*)/ms
    );

    if (match?.groups == null) {
        console.error(
            'x Unable to correctly parse `Changelog.md`, to play it safe I am not changing it.'
        );
        return { updated: false, error: true };
    }

    const { beginning, header, ending } = match.groups;

    const correctHeader = `${nextReleaseNumber} - ${withoutTime(new Date())}`;
    if (header === correctHeader) {
        console.log(
            `- The latest entry in \`Changelog.md\` already has the header \`${header}\`, no need to change it.`
        );
        return { updated: false, error: false };
    }

    if (
        header === 'Unreleased' ||
        header === `${nextReleaseNumber} - Unreleased`
    ) {
        writeFileSync(
            'Changelog.md',
            `${beginning}## ${correctHeader}${ending}`,
            { encoding: 'utf-8' }
        );
        console.log(
            `- Updated the header of the latest entry in \`Changelog.md\` to \`${correctHeader}\`.`
        );

        return { updated: true, error: false };
    }

    console.error(
        `x The latest entry in \`Changelog.md\` is not named \`Unreleased\` or \`${nextReleaseNumber} - Unreleased\`, to play it safe I am not changing it.`
    );

    return { updated: false, error: true };
};

const main = () => {
    const nextReleaseNumber = getNextReleaseNumber();

    const updatedPackageJson = updatePackageJson(nextReleaseNumber);
    const { updated: updatedChangelog, error } = updateChangelog(
        `${nextReleaseNumber}.0.0`
    );

    if (!updatedPackageJson && !updatedChangelog) {
        console.log('\nEverything already up-to-date.');
    } else if (!error) {
        console.log(
            '\nUpdated everything needed. You still need to bring these changes into main.'
        );
    }
};

const runAsScript = require.main === module;
if (runAsScript) {
    main();
}
