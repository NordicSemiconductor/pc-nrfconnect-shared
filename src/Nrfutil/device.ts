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
import { WithRequired } from '../utils/AppTypes';
import { getIsLoggingVerbose } from '../utils/persistentStore';
import {
    DeviceBuffer,
    DeviceCore,
    DeviceCoreInfo,
    DeviceTraits,
    FWInfo,
    GetProtectionStatusResult,
    HotplugEvent,
    JLinkProgrammingOptions,
    ListEvent,
    McuBootProgrammingOptions,
    McuState,
    NordicDfuProgrammingOptions,
    NrfutilDevice,
    ProgrammingOptions,
} from './deviceTypes';
import { type NrfutilSandboxType, prepareAndCreate } from './sandbox';
import { CancellableOperation, Progress } from './sandboxTypes';

export type NrfUtilDeviceType = ReturnType<typeof NrfUtilDevice>;

const isHotplugEvent = (
    event: HotplugEvent | ListEvent
): event is HotplugEvent => (event as HotplugEvent).event !== undefined;

const isListEvent = (event: HotplugEvent | ListEvent): event is ListEvent =>
    (event as ListEvent).devices !== undefined;

const isJLinkProgrammingOptions = (
    options: ProgrammingOptions
): options is JLinkProgrammingOptions =>
    (options as JLinkProgrammingOptions).chipEraseMode !== undefined;

const isMcuBootProgrammingOptions = (
    options: ProgrammingOptions
): options is McuBootProgrammingOptions =>
    (options as McuBootProgrammingOptions).netCoreUploadDelay !== undefined;

const isNordicDfuProgrammingOptions = (
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

    return args.length > 0 ? ['--options ', `${args.join(',')}`] : [];
};

const NrfUtilDevice = (sandbox: NrfutilSandboxType) => {
    const list = (
        traits: DeviceTraits,
        onEnumerated: (
            device: WithRequired<NrfutilDevice, 'serialNumber'>
        ) => void,
        onError: (error: Error) => void,
        onHotplugEvent?: {
            onDeviceArrived: (
                device: WithRequired<NrfutilDevice, 'serialNumber'>
            ) => void;
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
                        onEnumerated(
                            d as WithRequired<NrfutilDevice, 'serialNumber'>
                        );
                });
            } else if (onHotplugEvent && isHotplugEvent(data)) {
                if (
                    data.event === 'Arrived' &&
                    data.device &&
                    data.device.serialNumber
                ) {
                    onHotplugEvent.onDeviceArrived(
                        data.device as WithRequired<
                            NrfutilDevice,
                            'serialNumber'
                        >
                    );
                } else if (data.event === 'Left') {
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
        programmingOptions?: ProgrammingOptions
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            // Validate trait with ProgrammingOptions type !!

            const args: string[] = deviceTraitsToArgs(device.traits);

            const operation = sandbox
                .execSubcommand(
                    'program',
                    [
                        '--firmware',
                        firmwarePath,
                        '--serial-number',
                        device.serialNumber,
                        ...args,
                        ...(core ? ['--core', core] : []),
                        ...programmingOptionsToArgs(programmingOptions),
                    ],
                    onProgress
                )
                .then(() => resolve())
                .catch(reject);

            onCancel(operation.cancel);
        });

    const programBuffer = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        firmware: Buffer,
        type: 'hex' | 'zip',
        onProgress?: (progress: Progress) => void,
        core?: DeviceCore,
        programmingOptions?: ProgrammingOptions
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
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand(
                    'recover',
                    [
                        '--serial-number',
                        device.serialNumber,
                        ...(core ? ['--core', core] : []),
                    ],
                    onProgress
                )
                .then(() => resolve())
                .catch(reject);

            onCancel(operation.cancel);
        });

    const reset = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand(
                    'reset',
                    ['--serial-number', device.serialNumber],
                    onProgress
                )
                .then(() => resolve())
                .catch(reject);

            onCancel(operation.cancel);
        });

    const fwInfo = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<FWInfo> =>
        new CancelablePromise<FWInfo>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand<FWInfo>(
                    'fw-info',
                    [
                        '--serial-number',
                        device.serialNumber,
                        ...(core ? ['--core', core] : []),
                    ],
                    onProgress
                )
                .then(results => {
                    if (
                        results.taskEnd.length === 1 &&
                        results.taskEnd[0].data
                    ) {
                        resolve(results.taskEnd[0].data);
                    } else {
                        reject(new Error('Unexpected result'));
                    }
                })
                .catch(reject);

            onCancel(operation.cancel);
        });

    const setMcuState = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        state: McuState,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand(
                    'mcu-state-set',
                    [state, '--serial-number', device.serialNumber],
                    onProgress
                )
                .then(() => resolve())
                .catch(reject);

            onCancel(operation.cancel);
        });

    const coreInfo = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<DeviceCoreInfo> =>
        new CancelablePromise<DeviceCoreInfo>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand<DeviceCoreInfo>(
                    'core-info',
                    [
                        '--serial-number',
                        device.serialNumber,
                        ...(core ? ['--core', core] : []),
                    ],
                    onProgress
                )
                .then(results => {
                    if (
                        results.taskEnd.length === 1 &&
                        results.taskEnd[0].data
                    ) {
                        resolve(results.taskEnd[0].data);
                    } else {
                        reject(new Error('Unexpected result'));
                    }
                })
                .catch(reject);

            onCancel(operation.cancel);
        });
    const firmwareRead = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<Buffer> =>
        new CancelablePromise<Buffer>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand<DeviceBuffer>(
                    'fw-read',
                    [
                        '--serial-number',
                        device.serialNumber,
                        ...(core ? ['--core', core] : []),
                    ],
                    onProgress
                )
                .then(results => {
                    if (
                        results.taskEnd.length === 1 &&
                        results.taskEnd[0].data
                    ) {
                        resolve(
                            Buffer.from(
                                results.taskEnd[0].data.buffer,
                                'base64'
                            )
                        );
                    } else {
                        reject(new Error('Unexpected result'));
                    }
                })
                .catch(reject);

            onCancel(() => operation.cancel());
        });

    const erase = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<void> =>
        new CancelablePromise<void>((resolve, reject, onCancel) => {
            const operation = sandbox
                .execSubcommand(
                    'erase',
                    [
                        '--serial-number',
                        device.serialNumber,
                        ...(core ? ['--core', core] : []),
                    ],
                    onProgress
                )
                .then(() => resolve())
                .catch(reject);

            onCancel(operation.cancel);
        });

    const getProtectionStatus = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<GetProtectionStatusResult> =>
        new CancelablePromise<GetProtectionStatusResult>(
            (resolve, reject, onCancel) => {
                const operation = sandbox
                    .execSubcommand<GetProtectionStatusResult>(
                        'protection-get',
                        [
                            '--serial-number',
                            device.serialNumber,
                            ...(core ? ['--core', core] : []),
                        ],
                        onProgress
                    )
                    .then(results => {
                        if (
                            results.taskEnd.length === 1 &&
                            results.taskEnd[0].data
                        ) {
                            resolve(results.taskEnd[0].data);
                        } else {
                            reject(new Error('Unexpected result'));
                        }
                    })
                    .catch(reject);

                onCancel(operation.cancel);
            }
        );

    const setProtectionStatus = (
        device: WithRequired<NrfutilDevice, 'serialNumber'>,
        region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1',
        core?: DeviceCore,
        onProgress?: (progress: Progress) => void
    ): CancelablePromise<GetProtectionStatusResult> =>
        new CancelablePromise<GetProtectionStatusResult>(
            (resolve, reject, onCancel) => {
                const operation = sandbox
                    .execSubcommand<GetProtectionStatusResult>(
                        'protection-set',
                        [
                            region,
                            '--serial-number',
                            device.serialNumber,
                            ...(core ? ['--core', core] : []),
                        ],
                        onProgress
                    )
                    .then(results => {
                        if (
                            results.taskEnd.length === 1 &&
                            results.taskEnd[0].data
                        ) {
                            resolve(results.taskEnd[0].data);
                        } else {
                            reject(new Error('Unexpected result'));
                        }
                    })
                    .catch(reject);

                onCancel(operation.cancel);
            }
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
        coreInfo,
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
                deviceLib = lib;
                resolve(lib);
            })
            .catch(reject);
    });

export default getDeviceLib;
