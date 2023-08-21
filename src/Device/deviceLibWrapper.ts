/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { app } from '@electron/remote';
import {
    createContext,
    ModuleVersion,
    setTimeoutConfig,
} from '@nordicsemiconductor/nrf-device-lib-js';
import path from 'path';

let deviceLibContext = 0n;
export const getDeviceLibContext = () => {
    if (deviceLibContext === 0n) initDeviceLib();

    return deviceLibContext;
};

const initDeviceLib = () => {
    if (process.platform === 'win32') {
        const binariesPath = app.getAppPath().endsWith('app.asar')
            ? `${app.getAppPath()}.unpacked`
            : app.getAppPath();
        deviceLibContext = createContext({
            plugins_dir: path.join(
                binariesPath,
                'node_modules',
                '@nordicsemiconductor',
                'nrf-device-lib-js',
                'Release'
            ),
        });
    } else {
        deviceLibContext = createContext();
    }

    setTimeoutConfig(getDeviceLibContext(), {
        enumerateMs: 3 * 60 * 1000,
    });
};

type KnownModule = 'nrfdl' | 'nrfdl-js' | 'jprog' | 'JlinkARM';

const findTopLevel = (module: KnownModule, versions: ModuleVersion[]) =>
    versions.find(version => version.name === module);

const findInDependencies = (module: KnownModule, versions: ModuleVersion[]) => {
    if (versions.length > 0) {
        return getModuleVersion(
            module,
            versions.flatMap(version => [
                ...(version.dependencies ?? []),
                ...((version.plugins as ModuleVersion[]) ?? []),
            ])
        );
    }
};

export const getModuleVersion = (
    module: KnownModule,
    versions: ModuleVersion[] = []
): ModuleVersion | undefined =>
    findTopLevel(module, versions) ?? findInDependencies(module, versions);
