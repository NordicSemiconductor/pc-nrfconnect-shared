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
import { LogLevel, ModuleVersion } from './sandboxTypes';

const fallbackLevel = process.env.NODE_ENV === 'production' ? 'off' : 'error';

const getModuleSandbox = (module: string) => {
    let moduleSandbox: NrfutilSandbox | undefined;
    let promiseModuleSandbox: Promise<NrfutilSandbox> | undefined;

    return {
        isInitialised: () => !!moduleSandbox,
        get: async () => {
            if (moduleSandbox) {
                return moduleSandbox;
            }

            if (!promiseModuleSandbox) {
                const infoLog = getNrfutilLogger()?.info;
                infoLog?.(`Initialising nrfutil module: ${module}`);
                promiseModuleSandbox = sandbox(
                    getUserDataDir(),
                    module,
                    undefined,
                    undefined
                );
                moduleSandbox = await promiseModuleSandbox;

                if (module === 'device') {
                    moduleSandbox.getModuleVersion().then(logLibVersions);
                } else {
                    moduleSandbox
                        .getModuleVersion()
                        .then(moduleVersion =>
                            infoLog?.(
                                `Using ${module} version: ${describeVersion(
                                    moduleVersion.version
                                )}`
                            )
                        );
                }

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
                            // Unreachable
                            break;
                    }
                });

                const initialLogLevel = getIsLoggingVerbose()
                    ? 'trace'
                    : fallbackLevel;
                moduleSandbox.setLogLevel(initialLogLevel);
            }

            const box = await promiseModuleSandbox;

            return box;
        },
    };
};

const modules: Record<
    string,
    {
        isInitialised: () => boolean;
        get: () => Promise<NrfutilSandbox>;
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

const getAllIninitialisedModules = async () => {
    const moduleSandboxes: NrfutilSandbox[] = [];
    await Object.values(modules).reduce(
        (acc, val) =>
            acc.then(async () => {
                if (val.isInitialised()) {
                    moduleSandboxes.push(await val.get());
                }
            }),
        Promise.resolve()
    );

    return moduleSandboxes;
};

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

export const getAllModuleVersions = async () => {
    const moduleVersions: ModuleVersion[] = [];
    (await getAllIninitialisedModules()).reduce(
        (acc, moduleSandbox) =>
            acc.then(async () => {
                moduleVersions.push(await moduleSandbox.getModuleVersion());
            }),
        Promise.resolve()
    );
    return moduleVersions;
};
