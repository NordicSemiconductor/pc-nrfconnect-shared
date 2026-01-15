/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { getModule } from '..';
import {
    type DeviceTraits,
    deviceTraitsToArgs,
    type NrfutilDevice,
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
    event: HotplugEvent | ListEvent,
): event is HotplugEvent => (event as HotplugEvent).event !== undefined;

export default async (
    traits: DeviceTraits,
    onEnumerated: (devices: NrfutilDevice[]) => void,
    onError: (error: Error, pid?: number) => void,
    onHotplugEvent?: {
        onDeviceArrived: (device: NrfutilDevice) => void;
        onDeviceLeft: (id: number) => void;
    },
    timeout?: number,
) => {
    const args = [
        ...deviceTraitsToArgs(traits),
        ...(onHotplugEvent ? ['--hotplug'] : []),
        ...(timeout !== undefined ? ['--timeout-ms', timeout.toString()] : []),
    ];

    const onData = (data: HotplugEvent | ListEvent) => {
        if (isListEvent(data)) {
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

    const sandbox = await getModule('device');
    return sandbox.spawnBackgroundSubcommand<HotplugEvent>('list', args, {
        onData,
        onError,
    });
};
