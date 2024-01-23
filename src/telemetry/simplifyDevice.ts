/*
 * Copyright (c) 2023 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type Device } from '../Device/deviceSlice';

export default (device: Device) => ({
    devkit: device.devkit,
    serialPorts: device.serialPorts,
    traits: device.traits,
    serialNumber: device.serialNumber,
    enumerationID: device.id,
    usb: {
        product: device.usb?.product,
        manufacturer: device.usb?.manufacturer,
        deviceDescriptor: device.usb?.device.descriptor,
    },
});
