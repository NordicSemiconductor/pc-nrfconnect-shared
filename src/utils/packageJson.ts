/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { readFileSync } from 'fs';
import { PackageJson } from 'pc-nrfconnect-shared';

let packageJson: PackageJson | undefined;

export const loadPackageJson = (packageJsonPath: string) => {
    try {
        packageJson = JSON.parse(
            readFileSync(packageJsonPath, 'utf8')
        ) as PackageJson;
    } catch (e) {
        console.error(
            'Failed to read "package.json" of the app. Please tell the app developer to package it correctly.'
        );
    }
};

export default () => {
    if (packageJson == null) {
        throw new Error(`package.json was not read. This can be caused by one of two things:
- Either a programming error in the app that tries to use the content of package.json very early before it was loaded.
- Or if the app was packaged without a package.json, but in that case the launcher should not even launch this app.`);
    }

    return packageJson;
};
