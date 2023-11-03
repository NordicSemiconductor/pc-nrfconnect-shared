/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import si from 'systeminformation';

import { packageJson } from './packageJson';
import {
    deleteIsSendingUsageData,
    persistIsSendingUsageData,
} from './persistentStore';
import usageDataCommon, { Metadata } from './usageDataCommon';
import usageDataMain from './usageDataMain';
import usageDataRenderer from './usageDataRenderer';

const getFriendlyAppName = () =>
    packageJson().name.replace('pc-nrfconnect-', '');

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

const enable = () => {
    persistIsSendingUsageData(true);
    si.osInfo().then(({ platform, arch }) =>
        getUsageData().sendUsageData('Report OS info', { platform, arch })
    );
    getUsageData().sendUsageData('Data Usage Opt-In', undefined);
    usageDataCommon.getLogger()?.debug('Usage data has been enabled');
};

const disable = () => {
    getUsageData().sendUsageData('Data Usage Opt-Out', undefined, true);
    persistIsSendingUsageData(false);
    usageDataCommon.getLogger()?.debug('Usage data has been disabled');
};

const reset = () => {
    getUsageData().sendUsageData('Data Usage Opt-Reset', undefined, true);
    deleteIsSendingUsageData();
    usageDataCommon.getLogger()?.debug('Usage data setting has been reset');
};

const isRenderer = process && process.type === 'renderer';

const getUsageData = () => {
    if (isRenderer) {
        return usageDataRenderer;
    }

    return usageDataMain;
};

const sendUsageData = (
    action: string,
    metadata?: Metadata,
    forceSend?: boolean
) => {
    if (
        getUsageData().sendUsageData(
            `${getFriendlyAppName()}: ${action}`,
            flattenObject(metadata),
            forceSend
        )
    ) {
        usageDataCommon
            .getLogger()
            ?.debug(`Sending usage data ${JSON.stringify(action)}`);
    }
};

const sendPageView = (pageName: string) => {
    getUsageData().sendPageView(`${getFriendlyAppName()} - ${pageName}`);
};

const sendMetric = (name: string, average: number) => {
    getUsageData().sendMetric(name, average);
};

const sendTrace = (message: string) => {
    getUsageData().sendTrace(message);
};

const sendErrorReport = (error: string | Error) => {
    usageDataCommon.getLogger()?.error(error);
    getUsageData().sendErrorReport(
        typeof error === 'string' ? new Error(error) : error
    );
};

export default {
    setLogger: usageDataCommon.setLogger,
    disable,
    enable,
    isEnabled: usageDataCommon.isEnabled,
    reset,
    sendErrorReport,
    sendUsageData,
    sendPageView,
    sendMetric,
    sendTrace,
    enableTelemetry: usageDataCommon.enableTelemetry,
};
