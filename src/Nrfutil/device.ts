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

import logger from '../logging';
import { getAppDataDir } from '../utils/appDirs';
import {
    getIsLoggingVerbose,
    persistIsLoggingVerbose,
} from '../utils/persistentStore';
import {
    DeviceBuffer,
    DeviceCore,
    DeviceTraits,
    FWInfo,
    GetProtectionStatusResult,
    HotplugEvent,
    ListEvent,
    McuState,
    NrfutilDevice,
    ProgrammingOptions,
} from './deviceTypes';
import { type NrfutilSandboxType, prepareAndCreate } from './sandbox';
import { CancellableOperation, Progress, WithRequired } from './sandboxTypes';

export type NrfUtilDeviceType = ReturnType<typeof NrfUtilDevice>;

const isHotplugEvent = (
    event: HotplugEvent | ListEvent
): event is HotplugEvent => (event as HotplugEvent).event !== undefined;

const isListEvent = (event: HotplugEvent | ListEvent): event is ListEvent =>
    (event as ListEvent).devices !== undefined;

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

const NrfUtilDevice = (sandbox: NrfutilSandboxType) => {
    const list = (
        traits: DeviceTraits,
        onDeviceArrived: (
            device: WithRequired<NrfutilDevice, 'serialNumber'>
        ) => void,
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

        const onData = (data: HotplugEvent | ListEvent) => {
            if (isListEvent(data)) {
                data.devices.forEach(d => {
                    if (d.serialNumber)
                        onDeviceArrived(
                            d as WithRequired<NrfutilDevice, 'serialNumber'>
                        );
                });
            } else if (isHotplugEvent(data)) {
                if (
                    data.event === 'Arrived' &&
                    data.device &&
                    data.device.serialNumber
                ) {
                    onDeviceArrived(
                        data.device as WithRequired<
                            NrfutilDevice,
                            'serialNumber'
                        >
                    );
                } else if (data.event === 'Left' && onHotplugEvent) {
                    onHotplugEvent.onDeviceLeft(data.id);
                }
            }
        };

        return sandbox.execBackgroundSubcommand<HotplugEvent>('list', args, {
            onData,
            onError,
        });
    };

    const program = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        firmwarePath: string,
        onProgress?: (progress: Progress) => void,
        core?: DeviceCore,
        programmingOptions?: ProgrammingOptions[]
    ): CancelablePromise<void> => {
        // Validate trait with ProgrammingOptions type !!

        const args: string[] = [];
        args.concat(deviceTraitsToArgs(device.traits));

        return sandbox.execSubcommand(
            'program',
            [
                '--firmware',
                firmwarePath,
                '--serial-number',
                device.serialNumber,
                ...args,
                ...(core ? ['--core', core] : []),
                ...(programmingOptions && programmingOptions?.length > 0
                    ? ['--options', programmingOptions.join(',')]
                    : []),
            ],
            onProgress
        );
    };

    const programBuffer = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        firmware: Buffer,
        type: 'hex' | 'zip',
        onProgress?: (progress: Progress) => void,
        core?: DeviceCore,
        programmingOptions?: ProgrammingOptions[]
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
                onProgress,
                core,
                programmingOptions
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
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'recover',
            [
                '--serial-number',
                device.serialNumber,
                ...(core ? ['--core', core] : []),
            ],
            onProgress
        );

    const reset = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'reset',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const fwInfo = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<FWInfo> =>
        sandbox.execSubcommand(
            'fw-info',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const setMcuState = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        state: McuState,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'mcu-state-set',
            [state, '--serial-number', device.serialNumber],
            onProgress
        );

    const firmwareRead = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
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
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        sandbox.execSubcommand(
            'erase',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const getProtectionStatus = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<GetProtectionStatusResult> =>
        sandbox.execSubcommand(
            'protection-get',
            ['--serial-number', device.serialNumber],
            onProgress
        );

    const setProtectionStatus = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
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
        onLogging: sandbox.onLogging,
        setLogLevel: sandbox.setLogLevel,
        setVerboseLogging: (verbose: boolean) =>
            sandbox.setLogLevel(verbose ? 'trace' : 'error'),
        getModuleVersion: sandbox.getModuleVersion,
    };
};

let deviceLib: NrfUtilDeviceType | undefined;
let promiseDeviceLib: Promise<NrfUtilDeviceType> | undefined;

const getDeviceLib = () =>
    new Promise<NrfUtilDeviceType>((resolve, reject) => {
        if (deviceLib) {
            resolve(deviceLib);
            return;
        }

        if (!promiseDeviceLib) {
            promiseDeviceLib = prepareAndCreate<NrfUtilDeviceType>(
                path.join(getAppDataDir(), '../'),
                'device',
                '1.2.0',
                NrfUtilDevice
            );
        }

        promiseDeviceLib
            .then(lib => {
                lib.onLogging(evt => {
                    switch (evt.level) {
                        case 'TRACE':
                            logger.verbose(evt.message);
                            break;
                        case 'DEBUG':
                            logger.debug(evt.message);
                            break;
                        case 'INFO':
                            logger.info(evt.message);
                            break;
                        case 'WARN':
                            logger.warn(evt.message);
                            break;
                        case 'ERROR':
                            logger.error(evt.message);
                            break;
                        case 'CRITICAL':
                            logger.error(evt.message);
                            break;
                    }
                });
                lib.setVerboseLogging(getIsLoggingVerbose());
                // Only the first reset after selecting "reset with verbose logging" is relevant
                persistIsLoggingVerbose(false);
                deviceLib = lib;
                resolve(lib);
            })
            .catch(reject);
    });

export default getDeviceLib;
