/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    changelogIsCorrect,
    getLatestEntry,
    getNextReleaseNumber,
    latestEntryIsNotEmpty,
    latestHeaderIsCorrect,
    packageJsonIsCorrect,
} from './release-shared';

const noop = () => {};

test('determinding the next release number', () => {
    expect(getNextReleaseNumber('v34', { log: noop })).toBe(35);
});

describe('checking package.json', () => {
    test('no errors', () => {
        expect(
            packageJsonIsCorrect(34, {
                fail: noop,
                packageJson: '{"version": "34.0.0"}',
            })
        ).toBe(true);
    });
    test('version is wrong', () => {
        expect(
            packageJsonIsCorrect(34, {
                fail: noop,
                packageJson: '{"version": "33.0.0"}',
            })
        ).toBe(false);
    });
    test('format is wrong', () => {
        expect(
            packageJsonIsCorrect(34, {
                fail: noop,
                packageJson: '{"version": "34"}',
            })
        ).toBe(false);
    });
});

describe('checking Changelod.md', () => {
    test('no errors', () => {
        const correctChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## 34 - 2022-03-10

### Changed

-   Something`;

        expect(
            changelogIsCorrect(34, {
                fail: noop,
                now: new Date('2022-03-10T12:38:37.267Z'),
                changelog: correctChangelog,
            })
        ).toBe(true);
    });

    test('Unreleased entry', () => {
        const outdatedChangelog = `# Changelog

All notable changes to this project will be documented in this file.

## 33 - 2022-02-01

### Changed

-   Something`;

        expect(
            latestHeaderIsCorrect(34, {
                fail: noop,
                now: new Date('2022-03-10T12:38:37.267Z'),
                changelog: outdatedChangelog,
            })
        ).toBe(false);
    });

    test('Empty entry', () => {
        const emptyLatestEntry = `# Changelog

All notable changes to this project will be documented in this file.

## 34 - 2022-03-10

## 33 - 2022-02-01`;

        expect(
            latestEntryIsNotEmpty({
                fail: noop,
                changelog: emptyLatestEntry,
            })
        ).toBe(false);
    });
});

describe('Parsing Changelog.md', () => {
    const changelog = `# Changelog

All notable changes to this project will be documented in this file.

## 34 - 2023-04-20

### Changed

-   Something

## 33 - 2023-04-19

### Added

-   Something else
`;

    test('Extracting the latest entry', () => {
        expect(getLatestEntry(changelog)).toMatchObject({
            header: '34 - 2023-04-20',
            content: '### Changed\n\n-   Something',
        });
    });
});
