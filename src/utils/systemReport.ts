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
import { Device } from '../state';
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
            `    - ${d.serialport?.path}: ${d.serialNumber} ${
                d.boardVersion || ''
            }`
    ),
    '',
];

const hexpad2 = (n: number) =>
    n == null
        ? 'Unknown'
        : `0x${n.toString(16).toUpperCase().padStart(2, '0')}`;

const hexToKiB = (n: number) => (n == null ? 'Unknown' : `${n / 1024} KiB`);

const currentDeviceReport = (device: Device) => {
    if (device == null) {
        return [];
    }

    return [
        '- Current device:',
        `    - serialNumber:       ${device.serialNumber}`,
        `    - boardVersion:       ${device.boardVersion}`,
        `    - jlink:              ${device.jlink?.boardVersion}`,
        `    - nickname:           ${device.nickname}`,
        `    - serialNumber:       ${device.serialNumber}`,
        `    - serialport:         ${device.serialport}`,
        `        - path:           ${device.serialport?.path}`,
        `        - manufacturer:   ${device.serialport?.manufacturer}`,
        `        - productId:      ${device.serialport?.productId}`,
        `        - serialNumber:   ${device.serialport?.serialNumber}`,
        `        - vendorId:       ${device.serialport?.vendorId}`,
        `        - comName:       ${device.serialport?.comName}`,
        `    - traits:             ${device.traits}`,
        `        - usb:            ${device.traits.usb}`,
        `        - nordicUsb:      ${device.traits.nordicUsb}`,
        `        - nordicDfu:      ${device.traits.nordicDfu}`,
        `        - seggerUsb:      ${device.traits.seggerUsb}`,
        `        - jlink:          ${device.traits.jlink}`,
        `        - serialPort:     ${device.traits.serialPort}`,
        `        - broken:         ${device.traits.broken}`,
        `        - mcuboot:        ${device.traits.mcuboot}`,
        `        - modem:          ${device.traits.modem}`,
        `    - usb:             ${device.usb?.product}`,
        '',
    ];
};

export const generateSystemReport = async (
    timestamp: string,
    allDevices: Device[],
    currentDevice: Device
) =>
    [
        `# nRFConnect System Report - ${timestamp}`,
        '',
        ...(await generalInfoReport()),
        ...allDevicesReport(allDevices),
        ...currentDeviceReport(currentDevice),
    ].join(EOL);

export default async (allDevices: Device[], currentSerialNumber: string, currentDevice: Device) => {
    logger.info('Generating system report...');
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const report = await generateSystemReport(
        timestamp,
        allDevices,
        currentDevice
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
