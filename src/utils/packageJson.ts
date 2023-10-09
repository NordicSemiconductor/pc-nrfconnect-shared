/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type PackageJson,
    parsePackageJson,
} from '../../ipc/schema/packageJson';

let cache: PackageJson | undefined;

const parsedPackageJson = () => {
    if (cache != null) {
        return cache;
    }

    const parsed = parsePackageJson(process.env.PACKAGE_JSON_OF_APP ?? 'null');
    if (parsed.success) {
        cache = parsed.data;
    } else {
        throw new Error(
            `The env variable PACKAGE_JSON_OF_APP must be defined during bundling (through the bundler settings) with a valid package.json but wasn't. Fix this. Error: ${parsed.error.message}`
        );
    }

    return cache;
};

export default () => parsedPackageJson();
