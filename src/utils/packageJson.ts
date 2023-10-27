/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    type AppPackageJson,
    LauncherPackageJson,
    parseAppPackageJson,
    parseLauncherPackageJson,
} from '../../ipc/schema/packageJson';

let cacheApp: AppPackageJson | undefined;
let cacheLauncher: LauncherPackageJson | undefined;

const parsedPackageJson = (): AppPackageJson | LauncherPackageJson => {
    const launcherRenderer = !!process.env.PACKAGE_JSON_OF_RENDERER;

    return launcherRenderer
        ? parsedLauncherPackageJson()
        : parsedAppPackageJson();
};

const parsedAppPackageJson = (): AppPackageJson => {
    if (cacheApp != null) {
        return cacheApp;
    }

    const parsed = parseAppPackageJson(
        process.env.PACKAGE_JSON_OF_APP ?? 'null'
    );

    if (parsed.success) {
        cacheApp = parsed.data;
    } else {
        throw new Error(
            `The env variable PACKAGE_JSON_OF_APP must be defined during bundling (through the bundler settings) with a valid package.json but wasn't. Fix this. Error: ${parsed.error.message}`
        );
    }

    return cacheApp;
};

const parsedLauncherPackageJson = (): LauncherPackageJson => {
    if (cacheLauncher != null) {
        return cacheLauncher;
    }

    const parsed = parseLauncherPackageJson(
        process.env.PACKAGE_JSON_OF_RENDERER ?? 'null'
    );

    if (parsed.success) {
        cacheLauncher = parsed.data;
    } else {
        throw new Error(
            `The env variable PACKAGE_JSON_OF_RENDERER must be defined during bundling (through the bundler settings) with a valid package.json but wasn't. Fix this. Error: ${parsed.error.message}`
        );
    }

    return cacheLauncher;
};
export default () => parsedPackageJson();

export { parsedLauncherPackageJson, parsedAppPackageJson };
