#!/usr/bin/env tsx

/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/*
  A script to check if the current state of the repository is releasable.

  Requirement for this script: Have [the GitHub CLI tool `gh`](https://cli.github.com)
  installed and authenticate in it (run `gh auth login`).
*/

import packageJson from '../package.json';
import getReleaseNumbers from './get-release-numbers';
import { getLatestEntry } from './latest-changelog-entry';

const fail = (message: string) => {
    console.log(`::error::${message}`);
    process.exit(1);
};

const assertPackageJsonIsCorrect = (expectedVersionNumber: number) => {
    if (packageJson.version !== `${expectedVersionNumber}.0.0`) {
        fail(
            `Version number in package.json must be '${expectedVersionNumber}.0.0' but is '${packageJson.version}'`
        );
    }
};

const assertLatestEntryIsNotEmpty = () => {
    if (getLatestEntry().content.length === 0) {
        fail('Latest entry in `Changelog.md` does not contain anything.');
    }
};

const today = () => new Date().toISOString().split('T')[0];

const assertLatestHeaderIsCorrect = (expectedVersionNumber: number) => {
    const expectedHeaderline = `${expectedVersionNumber}.0.0 - ${today()}`;
    const actualHeaderline = getLatestEntry().header;

    if (expectedHeaderline !== actualHeaderline) {
        fail(
            `Latest entry in Changelog.md is not as expected:\n  Expected: ${expectedHeaderline}\n  Actual:   ${actualHeaderline}`
        );
    }
};

const assertChangelogIsCorrect = (expectedVersionNumber: number) => {
    assertLatestEntryIsNotEmpty();
    assertLatestHeaderIsCorrect(expectedVersionNumber);
};

const main = () => {
    const releaseNumbers = getReleaseNumbers();

    assertPackageJsonIsCorrect(releaseNumbers.next);
    assertChangelogIsCorrect(releaseNumbers.next);

    console.log(
        `The currently released version is ${releaseNumbers.latest}, so the next one will be ${releaseNumbers.next}.\n`
    );
};

main();
