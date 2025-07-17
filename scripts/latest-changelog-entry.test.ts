/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getLatestEntry } from './latest-changelog-entry';

describe('getLatestEntry', () => {
    it('should extract the latest changelog entry correctly', () => {
        const changelog = `# Changelog

All notable changes to this project will be documented in this file.

## 34.0.0 - 2022-03-10

### Changed

-   Something

## 33.0.0 - 2022-02-01

### Added
- Basic stuff`;

        const result = getLatestEntry(changelog);

        expect(result.header).toBe('34.0.0 - 2022-03-10');
        expect(result.content).toBe('### Changed\n\n-   Something');
    });

    it('should handle changelog with only one entry', () => {
        const changelog = `# Changelog

All notable changes to this project will be documented in this file.

## 33.0.0 - 2022-02-01

### Added

-   Something else`;

        const result = getLatestEntry(changelog);

        expect(result.header).toBe('33.0.0 - 2022-02-01');
        expect(result.content).toBe('### Added\n\n-   Something else');
    });

    it('should handle changelog with empty content', () => {
        const changelog = `# Changelog

All notable changes to this project will be documented in this file.

## 34.0.0 - 2022-03-10

## 33.0.0 - 2022-02-01

### Added

-   Something else`;

        const result = getLatestEntry(changelog);

        expect(result.header).toBe('34.0.0 - 2022-03-10');
        expect(result.content).toBe('');
    });

    it('should handle changelog with nothing before the first entry', () => {
        const changelog = `## 33.0.0 - 2022-02-01

### Added

-   Something else`;

        const result = getLatestEntry(changelog);

        expect(result.header).toBe('33.0.0 - 2022-02-01');
        expect(result.content).toBe('### Added\n\n-   Something else');
    });
});
