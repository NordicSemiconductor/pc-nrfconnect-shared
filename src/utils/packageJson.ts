/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import type { PackageJson } from '../../ipc/MetaFiles';

let cache: PackageJson | undefined;

const parsedPackageJson = () => {
    if (cache != null) {
        return cache;
    }

    const json = process.env.PACKAGE_JSON_OF_APP;
    cache = JSON.parse(json ?? 'null');
    if (cache == null) {
        throw new Error(
            "The env variable PACKAGE_JSON_OF_APP must be defined during bundling (through the bundler settings) but wasn't. Fix this."
        );
    }

    return cache;
};

export default () => parsedPackageJson();
