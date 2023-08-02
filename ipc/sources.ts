/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { UrlString } from './MetaFiles';

enum StandardSourceNames {
    OFFICIAL = 'official',
    LOCAL = 'local',
}

export const { LOCAL, OFFICIAL } = StandardSourceNames;
export const allStandardSourceNames: SourceName[] = [OFFICIAL, LOCAL];

export type SourceName = string;
export type SourceUrl = UrlString;
export type Source = { name: SourceName; url: SourceUrl };
