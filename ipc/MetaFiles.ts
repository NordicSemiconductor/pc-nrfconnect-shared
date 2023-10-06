/*
 * Copyright (c) 2022 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { z } from 'zod';

import { knownDevicePcas } from './device';

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

const semver = z.string().regex(
    // From https://semver.org
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/,
    'Is not a valid string for a semantic version'
);

const nrfutilModuleName = z.string();
const nrfutilModuleVersion = semver;

export type NrfutilModuleName = z.infer<typeof nrfutilModuleName>;
export type NrfutilModuleVersion = z.infer<typeof nrfutilModuleVersion>;

const nrfModules = z.record(
    nrfutilModuleName,
    nrfutilModuleVersion.array().nonempty()
);

export type NrfutilModules = z.infer<typeof nrfModules>;

const nrfConnectForDesktop = z.object({
    supportedDevices: z.enum(knownDevicePcas).array().nonempty().optional(),
    nrfutil: nrfModules.optional(),
    html: z.string(),
});

const recordOfOptionalStrings = z.record(z.string().optional());

const engines = recordOfOptionalStrings.and(
    z.object({ nrfconnect: z.string() })
);

const packageJson = z.object({
    name: z.string(),
    version: semver,

    author: z.string().optional(),
    bin: z.string().or(recordOfOptionalStrings).optional(),
    dependencies: recordOfOptionalStrings.optional(),
    description: z.string(),
    homepage: z.string().url().optional(),
    devDependencies: recordOfOptionalStrings.optional(),
    displayName: z.string(),
    engines,
    nrfConnectForDesktop,
    files: z.string().array().optional(),
    license: z.string().optional(),
    main: z.string().optional(),
    peerDependencies: recordOfOptionalStrings.optional(),
    repository: z
        .object({
            type: z.string(),
            url: z.string().url(),
        })
        .optional(),
    scripts: recordOfOptionalStrings.optional(),
});

export const parsePackageJson = (packageJsonContents: string) =>
    packageJson.safeParse(JSON.parse(packageJsonContents));

export type PackageJson = z.infer<typeof packageJson>;

// In the launcher we want to handle that the html in nrfConnectForDesktop
// can also be undefined, so there we need to use this variant
const legacyNrfConnectForDesktop = nrfConnectForDesktop.partial({ html: true });

const legacyPackageJson = packageJson.merge(
    z.object({
        nrfConnectForDesktop: legacyNrfConnectForDesktop,
    })
);

export const parseLegacyPackageJson = (packageJsonContents: string) =>
    legacyPackageJson.safeParse(JSON.parse(packageJsonContents));

export type LegacyPackageJson = z.infer<typeof legacyPackageJson>;
