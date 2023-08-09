/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import {
    DeviceTraits,
    deviceTraitsToArgs,
    getDeviceSandbox,
    NrfutilDevice,
    NrfutilDeviceWithSerialnumber,
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
    onEnumerated: (devices: NrfutilDeviceWithSerialnumber[]) => void,
    onError: (error: Error) => void,
    onHotplugEvent?: {
        onDeviceArrived: (device: NrfutilDeviceWithSerialnumber) => void;
        onDeviceLeft: (id: number) => void;
    }
) => {
    const args: string[] = [];
    args.concat(deviceTraitsToArgs(traits));

    if (onHotplugEvent) {
        args.push('--hotplug');
    }

    const onData = (data: HotplugEvent | ListEvent) => {
        if (isListEvent(data)) {
            onEnumerated(
                data.devices.filter(
                    d => d.serialNumber
                ) as NrfutilDeviceWithSerialnumber[]
            );
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
