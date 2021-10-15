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

const allDevicesReport = allDevices => [
    '- Connected devices:',
    ...allDevices.map(
        d =>
            `    - ${d.serialport.comName}: ${d.serialNumber} ${
                d.boardVersion || ''
            }`
    ),
    '',
];

const hexpad2 = n =>
    n == null
        ? 'Unknown'
        : `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;

const hexToKiB = n => (n == null ? 'Unknown' : `${n / 1024} KiB`);

const currentDeviceReport = (serialNumber, device) => {
    if (device == null) {
        return [];
    }

    return [
        '- Current device:',
        `    - serialNumber:    ${serialNumber}`,
        `    - family:          ${device.family}`,
        `    - type:            ${device.deviceType}`,
        `    - codeAddress      ${hexpad2(device.codeAddress)}`,
        `    - codePageSize     ${hexToKiB(device.codePageSize)}`,
        `    - codeSize         ${hexToKiB(device.codeSize)}`,
        `    - uicrAddress      ${hexpad2(device.uicrAddress)}`,
        `    - infoPageSize     ${hexToKiB(device.infoPageSize)}`,
        `    - codeRamPresent   ${device.codeRamPresent}`,
        `    - codeRamAddress   ${hexpad2(device.codeRamAddress)}`,
        `    - dataRamAddress   ${hexpad2(device.dataRamAddress)}`,
        `    - ramSize          ${hexToKiB(device.ramSize)}`,
        `    - qspiPresent      ${device.qspiPresent}`,
        `    - xipAddress       ${hexpad2(device.xipAddress)}`,
        `    - xipSize          ${hexToKiB(device.xipSize)}`,
        `    - pinResetPin      ${device.pinResetPin}`,
        '',
    ];
};

export const generateSystemReport = async (
    timestamp,
    allDevices,
    currentSerialNumber,
    currentDevice
) =>
    [
        `# nRFConnect System Report - ${timestamp}`,
        '',
        ...(await generalInfoReport()),
        ...allDevicesReport(allDevices),
        ...currentDeviceReport(currentSerialNumber, currentDevice),
    ].join(EOL);

export default async (allDevices, currentSerialNumber, currentDevice) => {
    logger.info('Generating system report...');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const report = await generateSystemReport(
        timestamp,
        allDevices,
        currentSerialNumber,
        currentDevice
    );

    const fileName = `nrfconnect-system-report-${timestamp}.txt`;
    const filePath = path.resolve(getAppDataDir(), fileName);

    try {
        fs.writeFileSync(filePath, report);
        logger.info(`System report: ${filePath}`);
        openFile(filePath);
    } catch (error) {
        logger.error(`Failed to generate system report: ${error.message}`);
    }
};
