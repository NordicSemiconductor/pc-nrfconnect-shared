#!/usr/bin/env ts-node

/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/*
  A script to release a new version of shared.

  Requirement for this script: Have [the GitHub CLI tool `gh`](https://cli.github.com)
  installed and authenticate in it (run `gh auth login`).

  Run
     npm run release-shared -- --dry-run
  to check whether the script thinks you can release a new version of shared.

  Run
     npm run release-shared
  to actually do the release.

  This script checks the contents in the branch `origin/main`.
  So if locally looks everything fine, please check `origin/main`.
*/
import { execSync, spawnSync } from 'node:child_process';

import { PackageJson } from '../ipc/MetaFiles';

const logError = (message: string) => {
    console.error(message);
};

const parseJson = <Result>(jsonString: string) =>
    JSON.parse(jsonString) as Result;

const git = (...commands) =>
    spawnSync('git', commands, {
        stdio: ['inherit', 'pipe', 'inherit'],
        encoding: 'utf-8',
    }).stdout;

const getLatestReleaseName = () =>
    parseJson<{ tagName: string }>(
        execSync(`gh release view --json tagName`, { encoding: 'utf-8' })
    ).tagName;

export const getNextReleaseNumber = (
    latestReleaseName = getLatestReleaseName(),
    { log } = { log: console.log }
) => {
    const latestReleaseNumber = Number(
        /^v(?<versionNumber>\d+)$/.exec(latestReleaseName)?.groups
            ?.versionNumber
    );

    const nextReleaseNumber = latestReleaseNumber + 1;

    log(
        `The currently released version is ${latestReleaseNumber}, so the next one will be ${nextReleaseNumber}.\n`
    );

    return nextReleaseNumber;
};

const equality = <T>(
    expected: T,
    actual: T,
    errorMessage: string,
    fail: typeof logError
) => {
    if (expected !== actual) {
        fail(
            `${errorMessage}:\n  Expected: ${expected}\n  Actual:   ${actual}\n`
        );
    }

    return expected === actual;
};

const getLatestPackageJson = () => git('show', 'origin/main:package.json');

export const packageJsonIsCorrect = (
    expectedVersionNumber: number,
    { fail, packageJson } = {
        fail: logError,
        packageJson: getLatestPackageJson(),
    }
) => {
    const expectedVersionString = `${expectedVersionNumber}.0.0`;
    const actualVersionString = parseJson<PackageJson>(packageJson).version;

    return equality(
        expectedVersionString,
        actualVersionString,
        'Version number in `package.json` is not as expected',
        fail
    );
};

const getLatestChangelog = () => git('show', 'origin/main:Changelog.md');

export const getLatestEntry = (changelog: string) => {
    const latestEntry = changelog.split('\n## ')[1];

    const header = latestEntry.split('\n')[0];
    const content = latestEntry.replace(/[^\n]*/, '').trim();

    return { header, content };
};

export const latestEntryIsNotEmpty = ({
    fail,
    changelog,
}: {
    fail: (message: string) => void;
    changelog: string;
}) => {
    const correct = getLatestEntry(changelog).content.length > 0;

    if (!correct) {
        fail('Latest entry in `Changelog.md` does not contain anything.');
    }

    return correct;
};

const withoutTime = (date: Date) => date.toISOString().split('T')[0];

export const latestHeaderIsCorrect = (
    expectedVersionNumber: number,
    { fail, now, changelog } = {
        fail: logError,
        now: new Date(),
        changelog: getLatestChangelog(),
    }
) => {
    const expectedHeaderline = `${expectedVersionNumber} - ${withoutTime(now)}`;
    const actualHeaderline = getLatestEntry(changelog).header;

    return equality(
        expectedHeaderline,
        actualHeaderline,
        'Latest entry in `Changelog.md` is not as expected',
        fail
    );
};

export const changelogIsCorrect = (
    expectedVersionNumber: number,
    { fail, now, changelog } = {
        fail: logError,
        now: new Date(),
        changelog: getLatestChangelog(),
    }
) =>
    latestEntryIsNotEmpty({ fail, changelog }) &&
    latestHeaderIsCorrect(expectedVersionNumber, { fail, now, changelog });

const doRelease = (nextReleaseNumber: number) => {
    const nextReleaseName = `v${nextReleaseNumber}`;
    const latestChangelogEntry = getLatestEntry(getLatestChangelog()).content;

    const dryRun = process.argv.includes('--dry-run');
    if (dryRun) {
        console.log(
            `Would create a release ${nextReleaseName} now, with this description:\n${latestChangelogEntry}`
        );
    } else {
        console.log(`Creating release ${nextReleaseName} now:`);
        const result = spawnSync(
            'gh',
            [
                'release',
                'create',
                nextReleaseName,
                '--title',
                nextReleaseName,
                '--notes',
                latestChangelogEntry,
            ],
            {
                stdio: 'inherit',
                encoding: 'utf-8',
            }
        );
        process.exitCode = result.status ?? 1;
    }
};

const main = () => {
    console.log(git('fetch'));
    const nextReleaseNumber = getNextReleaseNumber();

    const noErrors =
        packageJsonIsCorrect(nextReleaseNumber) &&
        changelogIsCorrect(nextReleaseNumber);

    if (noErrors) {
        doRelease(nextReleaseNumber);
    }
};

const runAsScript = require.main === module;
if (runAsScript) {
    main();
}
