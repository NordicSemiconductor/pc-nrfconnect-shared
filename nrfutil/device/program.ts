/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { type OnProgress } from '../sandboxTypes';
import {
    coreArg,
    DeviceCore,
    deviceSingleTaskEndOperationVoid,
    deviceTraitsToArgs,
    NrfutilDevice,
    ResetKind,
} from './common';

export type FileExtension = 'zip' | 'hex';

type FirmwareBuffer = { buffer: Buffer; type: FileExtension };
export type Firmware = FirmwareBuffer | string;

export type ProgrammingOptions =
    | JLinkProgrammingOptions
    | McuBootProgrammingOptions
    | NordicDfuProgrammingOptions;

export interface JLinkProgrammingOptions {
    chipEraseMode?: 'ERASE_ALL' | 'ERASE_NONE';
    reset?: ResetKind;
    verify?: 'VERIFY_HASH' | 'VERIFY_NONE' | 'VERIFY_READ';
}

export interface McuBootProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
    netCoreUploadDelay?: number;
    target?: string;
}

export interface NordicDfuProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
}

export const isJLinkProgrammingOptions = (
    options: ProgrammingOptions
): options is JLinkProgrammingOptions =>
    (options as JLinkProgrammingOptions).chipEraseMode !== undefined;

export const isMcuBootProgrammingOptions = (
    options: ProgrammingOptions
): options is McuBootProgrammingOptions =>
    (options as McuBootProgrammingOptions).netCoreUploadDelay !== undefined ||
    (options as McuBootProgrammingOptions).target !== undefined;

export const isNordicDfuProgrammingOptions = (
    options: ProgrammingOptions
): options is NordicDfuProgrammingOptions =>
    !isMcuBootProgrammingOptions(options) &&
    (options as NordicDfuProgrammingOptions).mcuEndState !== undefined;

export const programmingOptionsToArgs = (options?: ProgrammingOptions) => {
    if (!options) return [];

    const args: string[] = [];

    if (isJLinkProgrammingOptions(options)) {
        if (options.chipEraseMode)
            args.push(`chip_erase_mode=${options.chipEraseMode}`);
        if (options.reset) args.push(`reset=${options.reset}`);
        if (options.verify) args.push(`verify=${options.verify}`);
    } else if (isMcuBootProgrammingOptions(options)) {
        if (options.mcuEndState)
            args.push(`mcu_end_state=${options.mcuEndState}`);
        if (options.netCoreUploadDelay)
            args.push(
                `net_core_upload_delay=${Math.round(
                    options.netCoreUploadDelay
                )}`
            );
        if (options.target) args.push(`target=${options.target}`);
    } else if (isNordicDfuProgrammingOptions(options)) {
        if (options.mcuEndState)
            args.push(`mcu_end_state=${options.mcuEndState}`);
    }

    return args.length > 0 ? ['--options', `${args.join(',')}`] : [];
};
const program = (
    device: NrfutilDevice,
    firmwarePath: string,
    onProgress?: OnProgress,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions,
    controller?: AbortController
) =>
    deviceSingleTaskEndOperationVoid(
        device,
        'program',
        onProgress,
        controller,
        [
            '--firmware',
            firmwarePath,
            ...deviceTraitsToArgs(device.traits),
            ...coreArg(core),
            ...programmingOptionsToArgs(programmingOptions),
        ]
    );

export const createTempFile = (firmware: FirmwareBuffer): string => {
    let tempFilePath;
    do {
        tempFilePath = path.join(os.tmpdir(), `${uuid()}.${firmware.type}`);
    } while (fs.existsSync(tempFilePath));

    fs.writeFileSync(tempFilePath, firmware.buffer);

    return tempFilePath;
};

const programBuffer = async (
    device: NrfutilDevice,
    firmware: FirmwareBuffer,
    onProgress?: OnProgress,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions,
    controller?: AbortController
) => {
    const tempFilePath = createTempFile(firmware);
    try {
        await program(
            device,
            tempFilePath,
            onProgress,
            core,
            programmingOptions,
            controller
        );
    } catch (error) {
        fs.unlinkSync(tempFilePath);
        throw error;
    }
};

export default async (
    device: NrfutilDevice,
    firmware: Firmware,
    onProgress?: OnProgress,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions,
    controller?: AbortController
) => {
    if (typeof firmware === 'string') {
        await program(
            device,
            firmware,
            onProgress,
            core,
            programmingOptions,
            controller
        );
    } else {
        await programBuffer(
            device,
            firmware,
            onProgress,
            core,
            programmingOptions,
            controller
        );
    }
};
