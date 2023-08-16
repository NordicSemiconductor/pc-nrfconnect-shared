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
        // general check I write always. Keep if it makes sense.
        // Safeguard if undefined is passed so accessing any object property won't break with exception
        // same can be applied to the functions above
        if (!data) return;

        if (isListEvent(data)) {
            onEnumerated(
                data.devices.filter(
                    d => d.serialNumber
                ) as NrfutilDeviceWithSerialnumber[]
            );

            return;
        }

        if (!onHotplugEvent || !isHotplugEvent(data)) {
            return;
        }

        const newDeviceArrived =
            data.event === 'Arrived' && data.device?.serialNumber;

        if (newDeviceArrived) {
            onHotplugEvent.onDeviceArrived(
                data.device as NrfutilDeviceWithSerialnumber
            );
        }

        if (data.event === 'Left') {
            onHotplugEvent.onDeviceLeft(data.id);
        }
    };

    const sandbox = await getDeviceSandbox();
    return sandbox.execBackgroundSubcommand<HotplugEvent>('list', args, {
        onData,
        onError,
    });
};
