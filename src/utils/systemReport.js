/* Copyright (c) 2105 - 2019, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import si from 'systeminformation';
import path from 'path';
import fs from 'fs';
import { EOL } from 'os';
import pretty from 'prettysize';
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
            `    - ${d.serialport.path}: ${d.serialNumber} ${
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

export default async (allDevices, currentSerialNumber, currentDevice) => {
    logger.info('Generating system report...');

    const timestamp = new Date().toISOString().replace(/:/g, '-');

    const report = [
        `# nRFConnect System Report - ${timestamp}`,
        '',
        ...(await generalInfoReport()),
        ...allDevicesReport(allDevices),
        ...currentDeviceReport(currentSerialNumber, currentDevice),
    ].join(EOL);

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
