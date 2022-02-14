/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import nrfDeviceLib from '@nordicsemiconductor/nrf-device-lib-js';
import fs from 'fs';
import { EOL } from 'os';
import path from 'path';
import pretty from 'prettysize';
import si from 'systeminformation';

import {
    deviceInfo as getDeviceInfo,
    productPageUrl,
} from '../Device/deviceInfo/deviceInfo';
import {
    getDeviceLibContext,
    getModuleVersion,
} from '../Device/deviceLibWrapper';
import logger from '../logging';
import { Device } from '../state';
import { getAppDataDir } from './appDirs';
import describeVersion from './describeVersion';
import { openFile } from './open';

const generalInfoReport = async () => {
    const [
        { manufacturer, model },
        { vendor, version },
        { platform, distro, release, arch },
        { kernel, git, node, python, python3 },
        {
            manufacturer: cpuManufacturer,
            brand,
            speed,
            cores,
            physicalCores,
            processors,
        },
        { total, free },
        fsSize,
    ] = await Promise.all([
        si.system(),
        si.bios(),
        si.osInfo(),
        si.versions(),
        si.cpu(),
        si.mem(),
        si.fsSize(),
    ]);

    const versions = await nrfDeviceLib.getModuleVersions(
        getDeviceLibContext()
    );

    return [
        `- System:     ${manufacturer} ${model}`,
        `- BIOS:       ${vendor} ${version}`,
        `- CPU:        ${processors} x ${cpuManufacturer} ${brand} ${speed} GHz` +
            ` ${cores} cores (${physicalCores} physical)`,
        `- Memory:     ${pretty(free)} free of ${pretty(total)} total`,
        `- Filesystem: ${fsSize[0].fs} (${fsSize[0].type})` +
            ` ${pretty(Number(fsSize[0].size) || 0)}` +
            ` ${fsSize[0].use.toFixed(1)}% used`,
        '',
        `- OS:         ${distro} (${release}) ${platform} ${arch}`,
        '',
        '- Versions',
        `    - kernel: ${kernel}`,
        `    - git: ${git}`,
        `    - node: ${node}`,
        `    - python: ${python}`,
        `    - python3: ${python3}`,
        `    - nrfjprog DLL: ${describeVersion(
            getModuleVersion('jprog', versions)
        )}`,
        `    - JLink: ${describeVersion(getModuleVersion('jlink', versions))}`,
        '',
    ];
};

const allDevicesReport = (allDevices: Device[]) => [
    '- Connected devices:',
    ...allDevices.map(
        d =>
            `    - ${d.serialNumber} ${d.boardVersion || ''}: ${d.serialPorts
                ?.map(s => s.comName)
                .join(', ')}`
    ),
    '',
];

const currentDeviceReport = (device?: Device, currentSerialNumber?: string) => {
    if (device == null) {
        return [];
    }

    const deviceInfo = getDeviceInfo(device);

    return [
        '- Current device:',
        `    - name:          ${deviceInfo.name}`,
        `    - serialNumber:  ${currentSerialNumber}`,
        `    - cores:         ${deviceInfo.cores ?? 'Unknown'}`,
        `    - website:       ${productPageUrl(device) ?? 'Unknown'}`,
        '',
    ];
};

export const generateSystemReport = async (
    timestamp: string,
    allDevices: Device[],
    currentDevice?: Device,
    currentSerialNumber?: string
) =>
    [
        `# nRFConnect System Report - ${timestamp}`,
        '',
        ...(await generalInfoReport()),
        ...allDevicesReport(allDevices),
        ...currentDeviceReport(currentDevice, currentSerialNumber),
    ].join(EOL);

export default async (
    allDevices: Device[],
    currentSerialNumber: string,
    currentDevice: Device | null
) => {
    logger.info('Generating system report...');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const report = await generateSystemReport(
        timestamp,
        allDevices,
        currentDevice ?? undefined,
        currentSerialNumber
    );

    const fileName = `nrfconnect-system-report-${timestamp}.txt`;
    const filePath = path.resolve(getAppDataDir(), fileName);

    try {
        fs.writeFileSync(filePath, report);
        logger.info(`System report: ${filePath}`);
        openFile(filePath);
    } catch (error) {
        logger.logError('Failed to generate system report', error);
    }
};
