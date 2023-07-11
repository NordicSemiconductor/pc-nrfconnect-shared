/* eslint-disable @typescript-eslint/no-unused-vars */
/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    Device,
    DeviceCore,
    DeviceTraits,
    FWInfo,
    ProgrammingOptions,
} from './deviceTypes';
import nrfutilSandbox from './sandbox';
import {
    CancellableOperation,
    CancellablePromise,
    LogMessage,
    NrfUtilSettings,
    Progress,
} from './sandboxTypes';

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

export default (
    baseDir: string,
    module: string,
    version: string,
    setting: NrfUtilSettings,
    onLogging: (logging: LogMessage) => void
) => {
    const sandbox = nrfutilSandbox(
        baseDir,
        module,
        version,
        setting,
        onLogging
    );

    const enumerate = (
        traits: DeviceTraits,
        onDeviceArrived: (device: Device) => void,
        onError: (error: Error) => void,
        onHotplugEvent?: {
            onDeviceLeft: (id: number) => void;
        }
    ): CancellableOperation => {
        // const args: string[] = [];
        // args.concat(deviceTraitsToArgs(traits));

        // if (onHotplugEvent) {
        //     args.push('--hotplug');
        // }

        // const onData = (data: HotplugEvent) => {
        //     if (data.data.event === 'NRFDL_DEVICE_EVENT_ARRIVED' && data.data.device ) {
        //         onDeviceArrived(data.data.device)
        //     } else if (data.data.event === 'NRFDL_DEVICE_EVENT_LEFT' && onHotplugEvent) {
        //         onHotplugEvent.onDeviceLeft(data.data.id)
        //     }
        // };

        // return sandbox.execBackgroundSubcommand<HotplugEvent>('list', args, { onData, onError});

        throw new Error('Not implemented');
    };

    const program = (
        device: Device,
        firmwarePath: string,
        core: DeviceCore,
        programmingOptions: ProgrammingOptions,
        onProgress?: (progress: Progress) => void
    ): CancellablePromise<void> => {
        // Validate trait with ProgrammingOptions type !!

        // const args: string[] = [];
        // args.concat(deviceTraitsToArgs(traits));

        // return sandbox.execSubcommand('program', args, onProgress);

        throw new Error('Not implemented');
    };

    const recover = (
        device: Device,
        onProgress?: (progress: Progress) => void
    ): CancellablePromise<void> => {
        // return sandbox.execSubcommand('program', args, onProgress);

        throw new Error('Not implemented');
    };

    const fwInfo = (
        device: Device,
        onProgress?: (progress: Progress) => void
    ): CancellablePromise<FWInfo> => {
        // return sandbox.execSubcommand('program', args, onProgress);

        throw new Error('Not implemented');
    };

    return {
        ...sandbox,
        enumerate,
    };
};
