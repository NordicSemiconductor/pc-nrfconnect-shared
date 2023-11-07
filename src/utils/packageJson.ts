/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type PackageJson,
    type PackageJsonApp,
    parsePackageJson,
    parsePackageJsonApp,
} from '../../ipc/schema/packageJson';

let cache:
    | undefined
    | { type: 'launcher'; data: PackageJson }
    | { type: 'app'; data: PackageJsonApp };

export const isLauncher = (packageJson = parsedPackageJson()) =>
    packageJson.name === 'nrfconnect';

const parsedPackageJson = (): PackageJson | PackageJsonApp => {
    if (cache != null) {
        return cache.data;
    }

    const unparsed = process.env.PACKAGE_JSON ?? 'null';

    const parsed = parsePackageJson(unparsed);

    if (!parsed.success) {
        throw new Error(
            `The env variable PACKAGE_JSON must be defined during bundling (through the bundler settings) with a valid package.json but wasn't. Error: ${parsed.error.message}`
        );
    }

    if (isLauncher(parsed.data)) {
        cache = {
            type: 'launcher',
            data: parsed.data,
        };
    } else {
        const parsedAppPackageJson = parsePackageJsonApp(unparsed);
        if (!parsedAppPackageJson.success) {
            throw new Error(
                `The package.json must contain all values required for an app. Error: ${parsedAppPackageJson.error.message}`
            );
        }

        cache = {
            type: 'app',
            data: parsedAppPackageJson.data,
        };
    }

    return cache.data;
};

export const packageJson = parsedPackageJson;

export const packageJsonApp = () => {
    parsedPackageJson();

    if (cache?.type !== 'app') {
        throw new Error(
            `Required the package.json of an app. Actual content: ${JSON.stringify(
                cache
            )}`
        );
    }

    return cache.data;
};
