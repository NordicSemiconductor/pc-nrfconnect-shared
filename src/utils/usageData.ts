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

export const flatObject = (obj?: unknown, parentKey?: string): Metadata =>
    Object.entries(obj ?? {}).reduce((acc, [key, value]) => {
        const newKey = parentKey ? `${parentKey}.${key}` : key;
        return {
            ...acc,
            ...(typeof value === 'object'
                ? flatObject(value, newKey)
                : { [newKey]: value }),
        };
    }, {});

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

const sendUsageData = async (action: string, metadata?: Metadata) => {
    if (
        await getUsageData().sendUsageData(
            `${getFriendlyAppName()}: ${action}`,
            flatObject(metadata)
        )
    ) {
        usageDataCommon
            .getLogger()
            ?.debug(`Sending usage data ${JSON.stringify(action)}`);
    }
};

const sendPageView = (pageName: string) =>
    getUsageData().sendPageView(`${getFriendlyAppName()} - ${pageName}`);

const sendMetric = (name: string, average: number) =>
    getUsageData().sendMetric(name, average);

const sendTrace = (message: string) => getUsageData().sendTrace(message);

const sendErrorReport = (error: string | Error) => {
    usageDataCommon.getLogger()?.error(error);
    return getUsageData().sendErrorReport(
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
