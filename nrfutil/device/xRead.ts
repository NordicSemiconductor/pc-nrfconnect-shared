/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

/* eslint-disable no-bitwise */
import { type OnProgress } from '../sandboxTypes';
import {
    coreArg,
    type DeviceCore,
    deviceSingleTaskEndOperation,
    type NrfutilDevice,
} from './common';

export interface MemoryData {
    startAddress: string;
    values: number[];
}

export interface MemoryReadRaw {
    name: 'memory-read';
    serialNumber: string;
    memoryData: MemoryData[];
}

export type ReadResult = Awaited<ReturnType<typeof xRead>>;

export function toIntelHex(memoryData: MemoryData[]) {
    const sections = memoryData.map(d => ({
        startAddress: Number.parseInt(d.startAddress, 16),
        buffer: Buffer.from(d.values),
    }));

    const bytesPerLine = 16;

    const checksum = (bytes: number[]): number => {
        const sum = bytes.reduce((acc, b) => acc + b, 0);
        return (~sum + 1) & 0xff;
    };

    const formatRecord = (record: number[]) =>
        `:${record
            .map(b => b.toString(16).padStart(2, '0').toUpperCase())
            .join('')}`;

    const records = sections.flatMap(({ startAddress, buffer }) => {
        const totalLines = Math.ceil(buffer.length / bytesPerLine);
        let currentExtAddr = -1;

        return Array.from({ length: totalLines }).flatMap((_, i) => {
            const offset = i * bytesPerLine;
            const absoluteAddr = startAddress + offset;
            const extAddr = absoluteAddr >>> 16;
            const addr = absoluteAddr & 0xffff;
            const lineBytes = buffer.subarray(offset, offset + bytesPerLine);
            const recordList: string[] = [];

            if (extAddr !== currentExtAddr) {
                currentExtAddr = extAddr;
                const extRecord = [
                    0x02,
                    0x00,
                    0x00,
                    0x04,
                    (extAddr >> 8) & 0xff,
                    extAddr & 0xff,
                ];
                extRecord.push(checksum(extRecord));
                recordList.push(formatRecord(extRecord));
            }

            const dataRecord = [
                lineBytes.length,
                (addr >> 8) & 0xff,
                addr & 0xff,
                0x00,
                ...lineBytes,
            ];
            dataRecord.push(checksum(dataRecord));
            recordList.push(formatRecord(dataRecord));

            return recordList;
        });
    });

    records.push(':00000001FF');

    return { intelHex: records.join('\n') };
}

export type XReadOptions = {
    address: number;
    bytes: number;
    width?: 8 | 15 | 32; // defaults to 32
    direct?: boolean;
};

export const xReadOptionsToArgs = ({
    address,
    bytes,
    width,
    direct,
}: XReadOptions) => [
    '--address',
    address.toString(),
    '--bytes',
    bytes.toString(),
    ...(direct ? ['--direct'] : []),
    ...(width ? ['--width', width.toString()] : []),
];

const xRead = async (
    device: NrfutilDevice,
    options: XReadOptions,
    core?: DeviceCore,
    onProgress?: OnProgress,
    controller?: AbortController,
) => {
    const result = await deviceSingleTaskEndOperation<MemoryReadRaw>(
        device,
        'x-read',
        onProgress,
        controller,
        [...xReadOptionsToArgs(options), ...coreArg(core)],
    );

    return toIntelHex(result.memoryData);
};

export default xRead;
