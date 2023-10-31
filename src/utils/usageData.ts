/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import winston from 'winston';

import {
    AppPackageJson,
    LauncherPackageJson,
} from '../../ipc/schema/packageJson';
import { type Device } from '../Device/deviceSlice';
import packageJson from './packageJson';
import {
    deleteIsSendingUsageData,
    getIsSendingUsageData,
    persistIsSendingUsageData,
} from './persistentStore';
import usageDataMain from './usageDataMain';
import usageDataRenderer from './usageDataRenderer';

let logger: winston.Logger | undefined;
const setLogger = (log: winston.Logger) => {
    logger = log;
};

export interface Metadata {
    [key: string]: unknown;
}

export const simplifyDeviceForLogging = (device: Device) => ({
    devkit: device.devkit,
    serialPorts: device.serialPorts,
    traits: device.traits,
    usb: {
        product: device.usb?.product,
        manufacturer: device.usb?.manufacturer,
        deviceDescriptor: device.usb?.device.descriptor,
    },
});

const getFriendlyAppName = (json: AppPackageJson | LauncherPackageJson) =>
    (json.name ?? '').replace('pc-nrfconnect-', '');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const flattenObject = (obj?: any, parentKey?: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any = {};

    if (!obj) return result;

    Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        if (typeof value === 'object') {
            result = { ...result, ...flattenObject(value, newKey) };
        } else {
            result[newKey] = value;
        }
    });

    return result;
};

const isRenderer = process && process.type === 'renderer';

const isEnabled = () => {
    const isSendingUsageData = getIsSendingUsageData();
    logger?.debug(`Usage data is ${isSendingUsageData}`);
    return isSendingUsageData;
};

const enable = () => {
    persistIsSendingUsageData(true);
    logger?.debug('Usage data has been enabled');
};

const disable = () => {
    persistIsSendingUsageData(false);
    logger?.debug('Usage data has been disabled');
};

const reset = () => {
    deleteIsSendingUsageData();
    logger?.debug('Usage data setting has been reset');
};

const getUsageData = () => {
    if (isRenderer) {
        return usageDataRenderer;
    }

    return usageDataMain;
};

const sendUsageData = <T extends string>(
    action: T,
    metadata?: Metadata,
    forceSend?: boolean
) => {
    if (
        getUsageData().sendUsageData(
            `${getFriendlyAppName(packageJson())}: ${action}`,
            flattenObject(metadata),
            forceSend
        )
    ) {
        logger?.debug(`Sending usage data ${JSON.stringify(action)}`);
    }
};

const sendPageView = (pageName: string) => {
    getUsageData().sendPageView(
        `${getFriendlyAppName(packageJson())} - ${pageName}`
    );
};

const sendMetric = (name: string, average: number) => {
    getUsageData().sendMetric(name, average);
};

const sendTrace = (message: string) => {
    getUsageData()?.sendTrace(message);
};

const sendErrorReport = (error: string | Error) => {
    logger?.error(error);
    getUsageData().sendErrorReport(
        typeof error === 'string' ? new Error(error) : error
    );
};

export default {
    setLogger,
    disable,
    enable,
    isEnabled,
    reset,
    sendErrorReport,
    sendUsageData,
    sendPageView,
    sendMetric,
    sendTrace,
};
