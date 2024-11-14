/*
 * Copyright (c) 2024 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getUserDataDir } from '../src/utils/appDirs';
import { isLauncher, packageJsonApp } from '../src/utils/packageJson';
import { getIsLoggingVerbose } from '../src/utils/persistentStore';
import logLibVersions from './device/logLibVersions';
import { describeVersion } from './moduleVersion';
import { getNrfutilLogger } from './nrfutilLogger';
import sandbox, { NrfutilSandbox } from './sandbox';
import { LogLevel } from './sandboxTypes';

const fallbackLevel = process.env.NODE_ENV === 'production' ? 'off' : 'error';

const logModuleVersions = (module: string, moduleSandbox: NrfutilSandbox) => {
    if (module === 'device') {
        moduleSandbox.getModuleVersion().then(logLibVersions);
    } else {
        moduleSandbox.getModuleVersion().then(moduleVersion => {
            getNrfutilLogger()?.info(
                `Using the bundled nrfutil ${module} version: ${describeVersion(
                    moduleVersion.version
                )}`
            );
        });
    }

    moduleSandbox.getCoreVersion().then(moduleVersion => {
        getNrfutilLogger()?.info(
            `Using the bundled core version for nrfutil ${module}: ${describeVersion(
                moduleVersion.version
            )}`
        );
    });
};

const forwardLogging = (moduleSandbox: NrfutilSandbox) => {
    moduleSandbox.onLogging((evt, pid) => {
        const logger = getNrfutilLogger();
        const formatMsg = (msg: string) =>
            `${
                pid && moduleSandbox?.logLevel === 'trace'
                    ? `[PID:${pid}] `
                    : ''
            }${msg}`;

        switch (evt.level) {
            case 'TRACE':
                logger?.verbose(formatMsg(evt.message));
                break;
            case 'DEBUG':
                logger?.debug(formatMsg(evt.message));
                break;
            case 'INFO':
                logger?.info(formatMsg(evt.message));
                break;
            case 'WARN':
                logger?.warn(formatMsg(evt.message));
                break;
            case 'ERROR':
                logger?.error(formatMsg(evt.message));
                break;
            case 'CRITICAL':
                logger?.error(formatMsg(evt.message));
                break;
            case 'OFF':
            default:
                break;
        }
    });
};

const getModuleSandbox = (module: string) => {
    let moduleSandbox: NrfutilSandbox | undefined;
    let promiseModuleSandbox: Promise<NrfutilSandbox> | undefined;

    const createModuleSandbox = async () => {
        getNrfutilLogger()?.info(`Initialising the bundled nrfutil ${module}`);
        promiseModuleSandbox = sandbox(getUserDataDir(), module);
        moduleSandbox = await promiseModuleSandbox;

        logModuleVersions(module, moduleSandbox);
        forwardLogging(moduleSandbox);

        const initialLogLevel = getIsLoggingVerbose() ? 'trace' : fallbackLevel;
        moduleSandbox.setLogLevel(initialLogLevel);

        return moduleSandbox;
    };

    return {
        isInitialised: () => !!moduleSandbox,
        get: () =>
            moduleSandbox ?? promiseModuleSandbox ?? createModuleSandbox(),
    };
};

const modules: Record<
    string,
    {
        isInitialised: () => boolean;
        get: () => NrfutilSandbox | Promise<NrfutilSandbox>;
    }
> = {};
if (process.env.NODE_ENV !== 'test' && !isLauncher()) {
    const nrfutil = packageJsonApp().nrfConnectForDesktop.nrfutil;
    if (nrfutil) {
        Object.keys(nrfutil).forEach(module => {
            modules[module] = getModuleSandbox(module);
        });
    }
}

export const getModule = (module: string) => {
    if (modules[module]) {
        return modules[module].get();
    }

    throw new Error(`Module ${module} not found`);
};

export const isModuleInitialised = (module: string) =>
    !!modules[module]?.isInitialised();

const getAllIninitialisedModules = () =>
    Promise.all(
        Object.values(modules)
            .filter(module => module.isInitialised())
            .map(module => module.get())
    );

export const setLogLevel = async (level: LogLevel) => {
    (await getAllIninitialisedModules()).forEach(moduleSandbox =>
        moduleSandbox.setLogLevel(level)
    );
};

export const setVerboseLogging = async (verbose: boolean) => {
    (await getAllIninitialisedModules()).forEach(moduleSandbox =>
        moduleSandbox.setLogLevel(verbose ? 'trace' : fallbackLevel)
    );
};

export const getAllModuleVersions = async () =>
    Promise.all(
        (await getAllIninitialisedModules()).map(module =>
            module.getModuleVersion()
        )
    );
