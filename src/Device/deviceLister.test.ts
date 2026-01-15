/*
 * Copyright (c) 2015 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { type DeviceTraits } from '../../nrfutil/device/common';
import { hasValidDeviceTraits } from './deviceLister';

const allFalseDeviceTraits: DeviceTraits = {
    usb: false,
    nordicUsb: false,
    nordicDfu: false,
    seggerUsb: false,
    jlink: false,
    serialPorts: false,
    broken: false,
    mcuBoot: false,
    modem: false,
};

const someTrueDeviceTraits1: DeviceTraits = {
    usb: true,
    nordicUsb: true,
    nordicDfu: true,
    seggerUsb: false,
    jlink: false,
    serialPorts: false,
    broken: false,
    mcuBoot: false,
    modem: false,
};

const someTrueDeviceTraits2: DeviceTraits = {
    usb: false,
    nordicUsb: false,
    nordicDfu: true,
    seggerUsb: true,
    jlink: true,
    serialPorts: false,
    broken: false,
    mcuBoot: false,
    modem: false,
};

const someTrueDeviceTraits3: DeviceTraits = {
    usb: false,
    nordicUsb: false,
    nordicDfu: false,
    seggerUsb: false,
    jlink: false,
    serialPorts: false,
    broken: true,
    mcuBoot: true,
    modem: true,
};

describe('hasValidDeviceTraits Tests', () => {
    test('filter all undefined should be valid', () => {
        expect(hasValidDeviceTraits(allFalseDeviceTraits, {})).toBeTruthy();
        expect(hasValidDeviceTraits(someTrueDeviceTraits1, {})).toBeTruthy();
    });

    test('filter all false should be valid', () => {
        expect(
            hasValidDeviceTraits(allFalseDeviceTraits, allFalseDeviceTraits),
        ).toBeTruthy();
        expect(
            hasValidDeviceTraits(someTrueDeviceTraits1, allFalseDeviceTraits),
        ).toBeTruthy();
    });

    test('deviceTraits complete mismatch invalid', () => {
        expect(
            hasValidDeviceTraits(someTrueDeviceTraits1, someTrueDeviceTraits3),
        ).toBeFalsy();

        expect(hasValidDeviceTraits({}, someTrueDeviceTraits3)).toBeFalsy();
    });

    test('deviceTraits with at lease one match is valid', () => {
        expect(
            hasValidDeviceTraits(someTrueDeviceTraits1, someTrueDeviceTraits2),
        ).toBeTruthy();
    });
});

export default null;
