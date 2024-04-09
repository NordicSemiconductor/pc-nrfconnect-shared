/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { z } from 'zod';

export type UrlString = string;

export interface SourceJson {
    name: string;
    apps: UrlString[];
}

export type WithdrawnJson = UrlString[];

export type AppVersions = {
    [version: string]: AppVersion;
};

export type AppVersion = {
    shasum?: string;
    publishTimestamp?: string;
    tarballUrl: UrlString;
    nrfutilModules?: NrfutilModules;
};

export interface AppInfo {
    name: string;
    displayName: string;
    description: string;
    homepage?: UrlString;
    iconUrl: UrlString;
    releaseNotesUrl: UrlString;
    latestVersion: string;
    versions: AppVersions;
    installed?: {
        path: string;
        shasum?: string;
    };
}

export const semver = z.string().regex(
    // From https://semver.org
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    'Is not a valid string for a semantic version'
);

const nrfutilModuleName = z.string();
const nrfutilModuleVersion = semver;

export type NrfutilModuleName = z.infer<typeof nrfutilModuleName>;
export type NrfutilModuleVersion = z.infer<typeof nrfutilModuleVersion>;

export const nrfModules = z.record(
    nrfutilModuleName,
    nrfutilModuleVersion.array().nonempty()
);

export type NrfutilModules = z.infer<typeof nrfModules>;
