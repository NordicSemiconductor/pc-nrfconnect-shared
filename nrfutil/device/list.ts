/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import logger from '../../src/logging';
import {
    DeviceTraits,
    deviceTraitsToArgs,
    getDeviceSandbox,
    NrfutilDevice,
} from './common';

export interface HotplugEvent {
    id: number;
    event: 'Arrived' | 'Left';
    device?: NrfutilDevice;
}

export interface ListEvent {
    devices: NrfutilDevice[];
}

const isListEvent = (event: HotplugEvent | ListEvent): event is ListEvent =>
    (event as ListEvent).devices !== undefined;

const isHotplugEvent = (
    event: HotplugEvent | ListEvent
): event is HotplugEvent => (event as HotplugEvent).event !== undefined;

export default async (
    traits: DeviceTraits,
    onEnumerated: (devices: NrfutilDevice[]) => void,
    onError: (error: Error) => void,
    onHotplugEvent?: {
        onDeviceArrived: (device: NrfutilDevice) => void;
        onDeviceLeft: (id: number) => void;
    },
    timeout?: number
) => {
    const args: string[] = deviceTraitsToArgs(traits);

    if (onHotplugEvent) {
        args.push('--hotplug');
    }

    if (timeout !== undefined) {
        args.push('--timeout-ms');
        args.push(timeout.toString());
    }

    const onData = (data: HotplugEvent | ListEvent) => {
        if (isListEvent(data)) {
            data.devices
                .filter(d => !d.serialNumber)
                .forEach(d => {
                    logger.warn(
                        `Device was skipped as it has no Serial number ${JSON.stringify(
                            d
                        )}`
                    );
                });

            onEnumerated(data.devices);

            return;
        }

        if (!onHotplugEvent || !isHotplugEvent(data)) {
            return;
        }

        if (data.event === 'Arrived' && data.device) {
            onHotplugEvent.onDeviceArrived(data.device);
        } else if (data.event === 'Left') {
            onHotplugEvent.onDeviceLeft(data.id);
        }
    };

    const sandbox = await getDeviceSandbox();
    return sandbox.execBackgroundSubcommand<HotplugEvent>('list', args, {
        onData,
        onError,
    });
};
