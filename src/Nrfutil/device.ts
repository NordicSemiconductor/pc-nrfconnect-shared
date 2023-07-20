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
    NrfutilDeviceWithSerialnumber,
    ProgrammingOptions,
} from './deviceTypes';
import { type NrfutilSandboxType, prepareSandbox } from './sandbox';
import {
    CancellableOperation,
    LogLevel,
    LogMessage,
    Progress,
} from './sandboxTypes';

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

    return args.length > 0 ? ['--options', `${args.join(',')}`] : [];
};

const list = async (
    traits: DeviceTraits,
    onEnumerated: (device: NrfutilDeviceWithSerialnumber) => void,
    onError: (error: Error) => void,
    onHotplugEvent?: {
        onDeviceArrived: (device: NrfutilDeviceWithSerialnumber) => void;
        onDeviceLeft: (id: number) => void;
    }
): Promise<CancellableOperation> => {
    const args: string[] = [];
    args.concat(deviceTraitsToArgs(traits));

    if (onHotplugEvent) {
        args.push('--hotplug');
    }

    const onData = (data: HotplugEvent | ListEvent) => {
        if (isListEvent(data)) {
            data.devices.forEach(d => {
                if (d.serialNumber)
                    onEnumerated(d as NrfutilDeviceWithSerialnumber);
            });
        } else if (onHotplugEvent && isHotplugEvent(data)) {
            if (
                data.event === 'Arrived' &&
                data.device &&
                data.device.serialNumber
            ) {
                onHotplugEvent.onDeviceArrived(
                    data.device as NrfutilDeviceWithSerialnumber
                );
            } else if (data.event === 'Left') {
                onHotplugEvent.onDeviceLeft(data.id);
            }
        }
    };

    const sandbox = await getDeviceSandbox();
    return sandbox.execBackgroundSubcommand<HotplugEvent>('list', args, {
        onData,
        onError,
    });
};

const program = (
    device: NrfutilDeviceWithSerialnumber,
    firmwarePath: string,
    onProgress?: (progress: Progress) => void,
    core?: DeviceCore,
    programmingOptions?: ProgrammingOptions
): CancelablePromise<void> =>
    new CancelablePromise<void>((resolve, reject, onCancel) => {
        // Validate trait with ProgrammingOptions type !!

        const args: string[] = deviceTraitsToArgs(device.traits);

        getDeviceSandbox()
            .then(sandbox => {
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
            })
            .catch(reject);
    });

const programBuffer = (
    device: NrfutilDeviceWithSerialnumber,
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
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<void> =>
    new CancelablePromise<void>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
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
            })
            .catch(reject);
    });

const reset = (
    device: NrfutilDeviceWithSerialnumber,
    onProgress?: (progress: Progress) => void
): CancelablePromise<void> =>
    new CancelablePromise<void>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
                const operation = sandbox
                    .execSubcommand(
                        'reset',
                        ['--serial-number', device.serialNumber],
                        onProgress
                    )
                    .then(() => resolve())
                    .catch(reject);

                onCancel(operation.cancel);
            })
            .catch(reject);
    });

const getFwInfo = (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<FWInfo> =>
    new CancelablePromise<FWInfo>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
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
            })
            .catch(reject);
    });

const setMcuState = (
    device: NrfutilDeviceWithSerialnumber,
    state: McuState,
    onProgress?: (progress: Progress) => void
): CancelablePromise<void> =>
    new CancelablePromise<void>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
                const operation = sandbox
                    .execSubcommand(
                        'mcu-state-set',
                        [state, '--serial-number', device.serialNumber],
                        onProgress
                    )
                    .then(() => resolve())
                    .catch(reject);

                onCancel(operation.cancel);
            })
            .catch(reject);
    });

const getCoreInfo = (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<DeviceCoreInfo> =>
    new CancelablePromise<DeviceCoreInfo>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
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
            })
            .catch(reject);
    });
const firmwareRead = (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<Buffer> =>
    new CancelablePromise<Buffer>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
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
            })
            .catch(reject);
    });

const erase = (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<void> =>
    new CancelablePromise<void>((resolve, reject, onCancel) => {
        getDeviceSandbox()
            .then(sandbox => {
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
            })
            .catch(reject);
    });

const getProtectionStatus = (
    device: NrfutilDeviceWithSerialnumber,
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<GetProtectionStatusResult> =>
    new CancelablePromise<GetProtectionStatusResult>(
        (resolve, reject, onCancel) => {
            getDeviceSandbox()
                .then(sandbox => {
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
                })
                .catch(reject);
        }
    );

const setProtectionStatus = (
    device: NrfutilDeviceWithSerialnumber,
    region: 'All' | 'SecureRegions' | 'Region0' | 'Region0Region1',
    core?: DeviceCore,
    onProgress?: (progress: Progress) => void
): CancelablePromise<GetProtectionStatusResult> =>
    new CancelablePromise<GetProtectionStatusResult>(
        (resolve, reject, onCancel) => {
            getDeviceSandbox()
                .then(sandbox => {
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
                })
                .catch(reject);
        }
    );

const onLogging = async (handler: (logging: LogMessage) => void) => {
    const sandbox = await getDeviceSandbox();
    return sandbox.onLogging(handler);
};

const setLogLevel = async (level: LogLevel) => {
    const sandbox = await getDeviceSandbox();
    sandbox.setLogLevel(level);
};

const setVerboseLogging = async (verbose: boolean) => {
    const sandbox = await getDeviceSandbox();
    if (process.env.NODE_ENV === 'production' && !verbose) {
        sandbox.setLogLevel('off');
    } else {
        sandbox.setLogLevel(verbose ? 'trace' : 'error');
    }
};
const getModuleVersion = async () => {
    const sandbox = await getDeviceSandbox();
    return sandbox.getModuleVersion();
};

let deviceSandbox: NrfutilSandboxType | undefined;
let promiseDeviceSandbox: Promise<NrfutilSandboxType> | undefined;

const getDeviceSandbox = () =>
    new Promise<NrfutilSandboxType>((resolve, reject) => {
        if (deviceSandbox) {
            resolve(deviceSandbox);
            return;
        }

        if (!promiseDeviceSandbox) {
            promiseDeviceSandbox = prepareSandbox(
                path.join(getAppDataDir(), '../'),
                'device'
            );

            promiseDeviceSandbox.then(sandbox => {
                sandbox.onLogging(evt => {
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
                        case 'OFF':
                        default:
                            // Unreachable
                            break;
                    }
                });
                sandbox.setLogLevel(getIsLoggingVerbose() ? 'trace' : 'error');
                // Only the first reset after selecting "reset with verbose logging" is relevant
                persistIsLoggingVerbose(false);
                deviceSandbox = sandbox;
            });
        }

        promiseDeviceSandbox.then(resolve).catch(reject);
    });

export {
    program,
    programBuffer,
    erase,
    recover,
    reset,
    getProtectionStatus,
    setProtectionStatus,
    getFwInfo,
    setMcuState,
    getCoreInfo,
    list,
    firmwareRead,
    onLogging,
    setLogLevel,
    setVerboseLogging,
    getModuleVersion,
};
