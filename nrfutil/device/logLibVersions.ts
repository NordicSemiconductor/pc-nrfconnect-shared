/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { spawn } from 'child_process';
import os from 'os';

import describeError from '../../src/logging/describeError';
import {
    describeVersion,
    getExpectedVersion,
    resolveModuleVersion,
} from '../moduleVersion';
import { getNrfutilLogger } from '../nrfutilLogger';
import type { ModuleVersion, SubDependency } from '../sandboxTypes';

const log = (description: string, moduleVersion?: SubDependency | string) => {
    const logger = getNrfutilLogger();
    if (moduleVersion == null) {
        logger?.warn(`Unable to detect version of ${description}.`);
    } else {
        logger?.info(
            `Using ${description} version: ${describeVersion(moduleVersion)}`
        );
    }
};

const pathEnvVariable = () => {
    if (process.platform !== 'darwin') return process.env;

    return {
        ...process.env,
        PATH: `/bin:/usr/bin:/usr/local/bin:${process.env.PATH}`,
    };
};

const spawnAsync = (cmd: string, params?: string[]) =>
    new Promise<string>((resolve, reject) => {
        const codeProcess = spawn(cmd, params, {
            shell: true,
            env: pathEnvVariable(),
        });
        let stdout = '';
        let stderr = '';
        codeProcess.stdout.on('data', data => {
            stdout += data;
        });
        codeProcess.stderr.on('data', data => {
            stderr += data;
        });

        codeProcess.on('close', (code, signal) => {
            if (stderr) console.log(stderr);
            if (code === 0 && signal === null) {
                return resolve(stdout);
            }
            return reject();
        });
    });

const checkJLinkArchitectureOnDarwin = async () => {
    const stdout = await spawnAsync('file $(which JLinkExe)');
    const universalMatch = 'Mach-O universal binary with 2 architectures';
    const intelMatch = 'Mach-O 64-bit executable x86_64';
    if (stdout.includes(universalMatch)) return 'universal';
    if (stdout.includes(intelMatch)) return 'x86_64';
    return 'arm';
};

export default async (moduleVersion: ModuleVersion) => {
    const logger = getNrfutilLogger();
    try {
        const dependencies = moduleVersion.dependencies;

        log('nrfutil-device', moduleVersion.version);
        log('nrf-device-lib', resolveModuleVersion('nrfdl', dependencies));
        log('nrfjprog DLL', resolveModuleVersion('jprog', dependencies));
        log('JLink', resolveModuleVersion('JlinkARM', dependencies));

        const jlinkVersion = resolveModuleVersion('JlinkARM', dependencies);

        if (jlinkVersion) {
            const result = getExpectedVersion(jlinkVersion);
            if (!result.isExpectedVersion) {
                logger?.warn(
                    `Installed JLink version does not match the expected version (${result.expectedVersion})`
                );
            }
        } else {
            logger?.warn(
                `JLink is not installed. Please install JLink from: https://www.segger.com/downloads/jlink`
            );
        }
        if (
            process.platform === 'darwin' &&
            os.cpus()[0].model.includes('Apple')
        ) {
            const JLinkArchOnDarwin = await checkJLinkArchitectureOnDarwin();

            if (JLinkArchOnDarwin && JLinkArchOnDarwin !== 'universal') {
                const JLinkInstallerVersion =
                    JLinkArchOnDarwin === 'arm'
                        ? '64-bit Apple M1 Installer'
                        : '64-bit Intel Installer';
                logger?.warn(
                    `It looks like you have installed JLink using ${JLinkInstallerVersion}, but currently we only support their Universal Installer for your system.`
                );
                logger?.warn(
                    `Please install JLink: https://www.segger.com/downloads/jlink/JLink_MacOSX_V788j_universal.pkg`
                );
            }
        }
    } catch (error) {
        logger?.error(
            `Failed to get the library versions${
                error == null ? `: ${describeError(error)}` : ''
            }`
        );
    }
};
