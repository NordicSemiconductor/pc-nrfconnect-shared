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

type SemverString = string;

export type NrfutilModuleName = string;
export type NrfutilModuleVersion = SemverString;

export interface NrfutilModules {
    [name: NrfutilModuleName]: [
        NrfutilModuleVersion,
        ...NrfutilModuleVersion[]
    ];
}

export type AppVersion = {
    shasum?: string;
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

export const PackageJsonSchema = z.object({
    name: z.string(),
    version: z.string(),

    author: z.string().optional(),
    bin: z.union([z.record(z.string().optional()), z.string()]).optional(),
    description: z.string(),
    homepage: z.string(),
    devDependencies: z.record(z.string().optional()).optional(),
    displayName: z.string(),
    engines: z.object({
        nrfconnect: z.string(),
    }),
    nrfConnectForDesktop: z.object({
        html: z.string().optional(),
        nrfutil: z.record(z.array(z.string()).nonempty()).optional(),
    }),
    files: z.array(z.string()).nonempty().readonly(),
    license: z.string().optional(),
    main: z.string(),
    dependencies: z.record(z.string().optional()).optional(),
    peerDependencies: z.record(z.string().optional()).optional(),
    repository: z.object({
        type: z.literal('git'),
        url: z.string(),
    }),
    scripts: z.record(z.string().optional()).optional(),
});

export type PackageJson = z.infer<typeof PackageJsonSchema>;
