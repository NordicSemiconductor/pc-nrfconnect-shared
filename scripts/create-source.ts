#!/usr/bin/env tsx

/*
 * Copyright (c) 2025 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { Command, Option } from '@commander-js/extra-typings';

import { SourceJson } from '../ipc/MetaFiles';

const fail = (message: string) => {
    console.error(message);
    process.exit(1);
};

if (process.env.ARTIFACTORY_TOKEN == null)
    fail('The environment variable ARTIFACTORY_TOKEN must be set.');
const headers = { Authorization: `Bearer ${process.env.ARTIFACTORY_TOKEN}` };

const validAccessLevels = [
    'external',
    'external-confidential',
    'internal',
    'internal-confidential',
] as const;

const parseOptions = () =>
    new Command()
        .description('Create a new source in Artifactory')
        .requiredOption('-i, --id <id>', 'Source id, e.g. release-test')
        .addOption(
            new Option('-a, --access-level <access level>', 'Access level')
                .choices(validAccessLevels)
                .makeOptionMandatory()
        )
        .requiredOption('-n, --name <name>', 'Name, e.g. "Release Test"')
        .requiredOption(
            '-d, --description <description>',
            'Longer description, e.g. "Versions we intend to release next"'
        )
        .parse()
        .opts();

type Options = ReturnType<typeof parseOptions>;

const url = (opts: Options) =>
    `https://files.nordicsemi.com/artifactory/swtools/${opts.accessLevel}/ncd/apps/${opts.id}/source.json`;

const assertSourceDoesNotExist = async (opts: Options) => {
    const get = await fetch(url(opts), { headers });
    if (get.ok) fail(`Source ${url(opts)} already exists`);

    // TODO: Check that no other source with the same name exists
};

const uploadSourceJson = async (opts: Options) => {
    const source: SourceJson = {
        name: opts.name,
        description: opts.description,
        apps: [],
    };
    const put = await fetch(url(opts), {
        method: 'PUT',
        body: JSON.stringify(source, null, 2),
        headers,
    });
    if (!put.ok) fail(`Failed to upload ${url}: ${put.statusText}`);
};

const main = async () => {
    const opts = parseOptions();

    await assertSourceDoesNotExist(opts);
    await uploadSourceJson(opts);
};
main();
