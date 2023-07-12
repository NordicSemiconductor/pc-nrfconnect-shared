/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { CancelablePromise } from 'cancelable-promise';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { v4 as uuid } from 'uuid';

import {
    Device,
    DeviceBuffer,
    DeviceCore,
    DeviceTraits,
    FWInfo,
    GetProtectionStatusResult,
    HotplugEvent,
    ProgrammingOptions,
} from './deviceTypes';
import type { NrfutilSandboxType } from './sandbox';
import NrfutilSandbox from './sandbox';
import {
    CancellableOperation,
    LogMessage,
    NrfUtilSettings,
    Progress,
    WithRequired,
} from './sandboxTypes';

export type NrfUtilDeviceType = ReturnType<typeof NrfUtilDevice>;

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

export const prepareAndCreate = (
    baseDir: string,
    module: string,
    version: string,
    onLogging: (logging: LogMessage) => void,
    setting?: NrfUtilSettings
) =>
    new Promise<NrfUtilDeviceType>((resolve, reject) => {
        const sandbox = NrfutilSandbox(baseDir, module, version, setting);

        sandbox
            .isSandboxInstalled()
            .then(result => {
                if (!result) {
                    sandbox
                        .prepareSandbox()
                        .then(() => resolve(NrfUtilDevice(sandbox, onLogging)))
                        .catch(reject);
                    return;
                }

                resolve(NrfUtilDevice(sandbox, onLogging));
            })
            .catch(reject);
    });

const NrfUtilDevice = (
    sandbox: NrfutilSandboxType,
    onLogging: (logging: LogMessage) => void
) => {
    const releaseLogging = sandbox.onLogging(onLogging);

    const list = (
        traits: DeviceTraits,
        onDeviceArrived: (device: WithRequired<Device, 'serialNumber'>) => void,
        onError: (error: Error) => void,
        onHotplugEvent?: {
            onDeviceLeft: (id: number) => void;
        }
    ): CancellableOperation => {
        const args: string[] = [];
        args.concat(deviceTraitsToArgs(traits));

        if (onHotplugEvent) {
            args.push('--hotplug');
        }

        const onData = (data: HotplugEvent) => {
            if (
                data.event === 'NRFDL_DEVICE_EVENT_ARRIVED' &&
                data.device &&
                data.device.serialNumber
            ) {
                onDeviceArrived(
                    data.device as WithRequired<Device, 'serialNumber'>
                );
            } else if (
                data.event === 'NRFDL_DEVICE_EVENT_LEFT' &&
                onHotplugEvent
            ) {
                onHotplugEvent.onDeviceLeft(data.id);
            }
        };

        return sandbox.execBackgroundSubcommand<HotplugEvent>('list', args, {
            onData,
            onError,
        });
    };

    const program = (
        device: WithRequired<Device, 'serialNumber'>,
        firmwarePath: string,
        core: DeviceCore,
        programmingOptions: ProgrammingOptions,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> => {
        // Validate trait with ProgrammingOptions type !!

        // const args: string[] = [];
        // args.concat(deviceTraitsToArgs(traits));

        // return sandbox.execSubcommand('program', args, onProgress);

        throw new Error('Not implemented');
    };

    const programBuffer = (
        device: WithRequired<Device, 'serialNumber'>,
        firmware: Buffer,
        type: 'hex' | 'zip',
        core: DeviceCore,
        programmingOptions: ProgrammingOptions,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            const saveTemp = (): string => {
                let tempFilePath;
                do {
                    tempFilePath = path.join(os.tmpdir(), `${uuid()}.${type}`);
                } while (fs.existsSync(tempFilePath));

                fs.writeFileSync(tempFilePath, firmware);

                return tempFilePath;
            };

            const tempFilePath = saveTemp();
            const operation = program(
                device,
                tempFilePath,
                core,
                programmingOptions,
                onProgress
            );

            onCancel(() => {
                operation.cancel();
                fs.unlinkSync(tempFilePath);
            });

            operation
                .then(resolve)
                .catch(reject)
                .finally(() => fs.unlinkSync(tempFilePath));
        });

    const recover = (
        device: WithRequired<Device, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'recover',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const reset = (
        device: WithRequired<Device, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'reset',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const fwInfo = (
        device: WithRequired<Device, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<FWInfo> =>
        sandbox.execSubcommand(
            'fw-info',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const setMcuState = (
        device: WithRequired<Device, 'serialNumber'>,
        state: 'Application' | 'Programming',
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'mcu-state-set',
            [state, '--serial-number', device.serialNumber],
            onProgress
        );

    const firmwareRead = (
        device: WithRequired<Device, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<Buffer> =>
        new CancelablePromise<Buffer>((resolve, reject, onCancel) => {
            const operation = sandbox.execSubcommand<DeviceBuffer>(
                'fw-read',
                ['--serial-number', device.serialNumber],
                onProgress
            );

            onCancel(() => operation.cancel());

            operation
                .then(deviceBuffer =>
                    resolve(Buffer.from(deviceBuffer.buffer, 'base64'))
                )
                .catch(reject);
        });

    const erase = (
        device: WithRequired<Device, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'erase',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const getProtectionStatus = (
        device: WithRequired<Device, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<GetProtectionStatusResult> =>
        sandbox.execSubcommand(
            'protection-get',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const setProtectionStatus = (
        device: WithRequired<Device, 'serialNumber'>,
        region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1',
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<GetProtectionStatusResult> =>
        sandbox.execSubcommand(
            'protection-set',
            [region, '--serial-number', device.serialNumber],
            onProgress
        );

    return {
        program,
        programBuffer,
        erase,
        recover,
        reset,
        getProtectionStatus,
        setProtectionStatus,
        fwInfo,
        setMcuState,
        list,
        firmwareRead,
        release: () => {
            releaseLogging();
        },
    };
};

export default NrfUtilDevice;
