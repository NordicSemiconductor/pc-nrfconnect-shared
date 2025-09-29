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

interface JLinkProgrammingOptions {
    chipEraseMode: 'ERASE_ALL' | 'ERASE_NONE';
    reset?: ResetKind;
    verify?: 'VERIFY_HASH' | 'VERIFY_NONE' | 'VERIFY_READ';
}

interface McuBootProgrammingOptions {
    mcuEndState?: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
    netCoreUploadDelay?: number;
    target?: string;
}

interface NordicDfuProgrammingOptions {
    mcuEndState: 'NRFDL_MCU_STATE_APPLICATION' | 'NRFDL_MCU_STATE_PROGRAMMING';
}

const isJLinkProgrammingOptions = (
    options: ProgrammingOptions,
): options is JLinkProgrammingOptions =>
    (options as JLinkProgrammingOptions).chipEraseMode !== undefined;

const isMcuBootProgrammingOptions = (
    options: ProgrammingOptions,
): options is McuBootProgrammingOptions =>
    (options as McuBootProgrammingOptions).netCoreUploadDelay !== undefined ||
    (options as McuBootProgrammingOptions).target !== undefined;

export const isNordicDfuProgrammingOptions = (
    options: ProgrammingOptions,
): options is NordicDfuProgrammingOptions =>
    !isMcuBootProgrammingOptions(options) &&
    (options as NordicDfuProgrammingOptions).mcuEndState !== undefined;

const programmingOptionsToStrings = (options?: ProgrammingOptions) => {
    if (!options) return [];

    if (isJLinkProgrammingOptions(options)) {
        return [
            `chip_erase_mode=${options.chipEraseMode}`,
            options.reset && `reset=${options.reset}`,
            options.verify && `verify=${options.verify}`,
        ].filter(Boolean);
    }

    if (isMcuBootProgrammingOptions(options)) {
        return [
            options.mcuEndState && `mcu_end_state=${options.mcuEndState}`,
            options.target && `target=${options.target}`,
            options.netCoreUploadDelay &&
                `net_core_upload_delay=${Math.round(
                    options.netCoreUploadDelay,
                )}`,
        ].filter(Boolean);
    }

    if (isNordicDfuProgrammingOptions(options)) {
        return [`mcu_end_state=${options.mcuEndState}`];
    }

    throw new Error(`Unhandled ProgrammingOptions: ${options}`);
};

export const programmingOptionsToArgs = (options?: ProgrammingOptions) => {
    const optionsString = programmingOptionsToStrings(options).join(',');

    return optionsString.length > 0 ? ['--options', optionsString] : [];
};

const program = (
    device: NrfutilDevice,
    firmwarePath: string,
    onProgress?: OnProgress,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions,
    controller?: AbortController,
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
        ],
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
    controller?: AbortController,
) => {
    const tempFilePath = createTempFile(firmware);
    try {
        await program(
            device,
            tempFilePath,
            onProgress,
            core,
            programmingOptions,
            controller,
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
    controller?: AbortController,
) => {
    if (typeof firmware === 'string') {
        await program(
            device,
            firmware,
            onProgress,
            core,
            programmingOptions,
            controller,
        );
    } else {
        await programBuffer(
            device,
            firmware,
            onProgress,
            core,
            programmingOptions,
            controller,
        );
    }
};
