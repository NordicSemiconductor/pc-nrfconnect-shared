/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import winston from 'winston';

import { type Device } from '../Device/deviceSlice';
import { getHasUserAgreedToTelemetry } from '../utils/persistentStore';

export const INSTRUMENTATION_KEY = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

let isTelemetryAllowedForCurrentApp = false;

const allowTelemetryForCurrentApp = () => {
    isTelemetryAllowedForCurrentApp = true;
};

let logger: winston.Logger | undefined;
const setLogger = (log: winston.Logger) => {
    logger = log;
};

const getLogger = () => logger;

export interface Metadata {
    [key: string]: unknown;
}

export const simplifyDeviceForLogging = (device: Device) => ({
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

const isEnabled = () => {
    const isSendingTelemetry = getShouldSendTelemetry();
    logger?.debug(`Telemetry is ${isSendingTelemetry}`);
    return isSendingTelemetry;
};

const getShouldSendTelemetry = (sendingOptOut?: boolean) =>
    (sendingOptOut || getHasUserAgreedToTelemetry()) &&
    isTelemetryAllowedForCurrentApp;

export default {
    setLogger,
    getLogger,
    isEnabled,
    getShouldSendTelemetry,
    allowTelemetryForCurrentApp,
};
