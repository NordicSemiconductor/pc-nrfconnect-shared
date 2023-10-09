/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { z } from 'zod';

import { knownDevicePcas } from '../device';
import { nrfModules, semver } from '../MetaFiles';

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
