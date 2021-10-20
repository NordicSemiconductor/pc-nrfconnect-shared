/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import { EOL } from 'os';
import path from 'path';
import pretty from 'prettysize';
import si from 'systeminformation';

import logger from '../logging';
import { Device, DeviceInfo } from '../state';
import { getAppDataDir } from './appDirs';
import { openFile } from './open';

/* eslint-disable object-curly-newline */
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
        '',
    ];
};

const allDevicesReport = (allDevices: Device[]) => [
    '- Connected devices:',
    ...allDevices.map(
        d =>
            `    - ${d.serialport?.comName}: ${d.serialNumber} ${
                d.boardVersion || ''
            }`
    ),
    '',
];

const currentDeviceReport = (
    device: DeviceInfo,
    currentSerialNumber: string
) => {
    if (device == null) {
        return [];
    }

    return [
        '- Current device:',
        `    - name:          ${device.name}`,
        `    - serialNumber:  ${currentSerialNumber}`,
        `    - cores:         ${device.cores}`,
        `    - website:       ${device.website}`,
        '',
    ];
};

export const generateSystemReport = async (
    timestamp: string,
    allDevices: Device[],
    currentDevice: DeviceInfo,
    currentSerialNumber: string
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
    currentDevice: DeviceInfo
) => {
    logger.info('Generating system report...');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const report = await generateSystemReport(
        timestamp,
        allDevices,
        currentDevice,
        currentSerialNumber
    );

    const fileName = `nrfconnect-system-report-${timestamp}.txt`;
    const filePath = path.resolve(getAppDataDir(), fileName);

    try {
        fs.writeFileSync(filePath, report);
        logger.info(`System report: ${filePath}`);
        openFile(filePath);
    } catch (error) {
        const details = error instanceof Error ? error.message : error;
        logger.error(`Failed to generate system report: ${details}`);
    }
};
