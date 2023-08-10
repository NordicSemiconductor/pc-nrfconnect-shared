/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import { Progress } from '../sandboxTypes';
import {
    DeviceCore,
    deviceSingleTaskEndOperationVoid,
    DeviceTraits,
    NrfutilDeviceWithSerialnumber,
    ResetKind,
} from './common';

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

const deviceTraitsToArgs = (traits: DeviceTraits) => {
    const args: string[] = [];
    const traitsString = Object.keys(traits)
        .map(trait => (traits[trait as keyof DeviceTraits] ? trait : null))
        .filter(t => t !== null)
        .join(',');

    if (traitsString.length > 0) {
        args.push('--traits');
        args.push(traitsString);
    }

    return args;
};

const programmingOptionsToArgs = (options?: ProgrammingOptions) => {
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
    type: 'hex' | 'zip',
    onProgress?: (progress: Progress) => void,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions,
    controller?: AbortController
) => {
    const saveTemp = (): string => {
        let tempFilePath;
        do {
            tempFilePath = path.join(os.tmpdir(), `${uuid()}.${type}`);
        } while (fs.existsSync(tempFilePath));

        fs.writeFileSync(tempFilePath, firmware);

        return tempFilePath;
    };

    const tempFilePath = saveTemp();
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
    firmware: { buffer: Buffer; type: 'hex' | 'zip' } | string,
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
    } else {
        await programBuffer(
            device,
            firmware.buffer,
            firmware.type,
            onProgress,
            core,
            programmingOptions,
            controller
        );
    }
};
