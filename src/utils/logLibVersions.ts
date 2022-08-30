/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    getModuleVersions,
    ModuleVersion,
} from '@nordicsemiconductor/nrf-device-lib-js';
import { spawn } from 'child_process';
import os from 'os';

import {
    getDeviceLibContext,
    getModuleVersion,
} from '../Device/deviceLibWrapper';
import logger from '../logging';
import describeVersion from './describeVersion';

const log = (description: string, moduleVersion?: ModuleVersion) => {
    if (moduleVersion == null) {
        logger.warn(`Unable to detect version of ${description}.`);
    } else {
        logger.info(
            `Using ${description} version: ${describeVersion(moduleVersion)}`
        );
    }
};

const pathEnvVariable = () => {
    if (process.platform !== 'darwin') return process.env;

    return {
        ...process.env,
        PATH: `/usr/local/bin:${process.env.PATH}`,
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

export default async () => {
    try {
        const versions = await getModuleVersions(getDeviceLibContext());
        const JLinkArch =
            process.platform === 'darwin' &&
            os.cpus()[0].model.includes('Apple') &&
            (await checkJLinkArchitectureOnDarwin());

        log('nrf-device-lib-js', getModuleVersion('nrfdl-js', versions));
        log('nrf-device-lib', getModuleVersion('nrfdl', versions));
        log('nrfjprog DLL', getModuleVersion('jprog', versions));
        log('JLink', getModuleVersion('JlinkARM', versions));
        if (JLinkArch && JLinkArch !== 'universal') {
            const JLinkInstallerVersion =
                JLinkArch === 'arm'
                    ? '64-bit Apple M1 Installer'
                    : '64-bit Installer';

            logger.warn(`
                We detected that you have installed JLink using Segger's ${JLinkInstallerVersion},
                but recommend you install JLink using their Universal Installer:
                https://www.segger.com/downloads/jlink/JLink_MacOSX_V766a_universal.pkg
                `);
        }
    } catch (error) {
        logger.logError('Failed to get the library versions', error);
    }
};
