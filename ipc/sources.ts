/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

enum StandardSourceNames {
    OFFICIAL = 'official',
    LOCAL = 'local',
}

export const { LOCAL, OFFICIAL } = StandardSourceNames;

export type SourceName = string;
