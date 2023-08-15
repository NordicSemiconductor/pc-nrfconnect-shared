/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';

import { Progress } from '../sandboxTypes';
import {
    DeviceCore,
    deviceSingleTaskEndOperationVoid,
    deviceTraitsToArgs,
    FileExtensions,
    NrfutilDeviceWithSerialnumber,
    ResetKind,
} from './common';
import { saveTempFile } from './helpers';

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
    (options as McuBootProgrammingOptions).netCoreUploadDelay !== undefined;

export const isNordicDfuProgrammingOptions = (
    options: ProgrammingOptions
): options is NordicDfuProgrammingOptions =>
    !isMcuBootProgrammingOptions(options) &&
    (options as NordicDfuProgrammingOptions).mcuEndState !== undefined;

const programmingOptionsToArgs = (options?: ProgrammingOptions) => {
    if (!options) return [];

    const args: string[] = [];

    // if we trust isJLinkProgrammingOptions() / isMcuBootProgrammingOptions() / isNordicDfuProgrammingOptions()
    // ...methods, "else" can be removed
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
    } else if (isNordicDfuProgrammingOptions(options)) {
        if (options.mcuEndState)
            args.push(`mcu_end_state=${options.mcuEndState}`);
    }

    return args.length > 0 ? ['--options', `${args.join(',')}`] : [];
};
const program = (
    device: NrfutilDeviceWithSerialnumber,
    firmwarePath: string,
    onProgress?: (progress: Progress) => void,
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
            ...(core ? ['--core', core] : []),
            ...programmingOptionsToArgs(programmingOptions),
        ]
    );

const programBuffer = async (
    device: NrfutilDeviceWithSerialnumber,
    firmware: Buffer,
    type: FileExtensions,
    onProgress?: (progress: Progress) => void,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions,
    controller?: AbortController
) => {
    const tempFilePath = saveTempFile(firmware, type);

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
    }
};

export default async (
    device: NrfutilDeviceWithSerialnumber,
    firmware: { buffer: Buffer; type: FileExtensions } | string,
    onProgress?: (progress: Progress) => void,
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

        return;
    }

    await programBuffer(
        device,
        firmware.buffer,
        firmware.type,
        onProgress,
        core,
        programmingOptions,
        controller
    );
};
