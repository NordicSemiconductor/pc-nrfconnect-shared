/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import si from 'systeminformation';

import { packageJson } from '../utils/packageJson';
import {
    deleteIsSendingTelemetry,
    persistIsSendingTelemetry,
} from '../utils/persistentStore';
import telemetryCommon, { Metadata } from './telemetryCommon';
import telemetryMain from './telemetryMain';
import telemetryRenderer from './telemetryRenderer';

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
    persistIsSendingTelemetry(true);
    si.osInfo().then(({ platform, arch }) =>
        getTelemetry().sendUsageData('Report OS info', { platform, arch })
    );
    getTelemetry().sendUsageData('Telemetry Opt-In', undefined);
    telemetryCommon.getLogger()?.debug('Usage data has been enabled');
};

const disable = () => {
    getTelemetry().sendUsageData('Telemetry Opt-Out', undefined, true);
    persistIsSendingTelemetry(false);
    telemetryCommon.getLogger()?.debug('Usage data has been disabled');
};

const reset = () => {
    getTelemetry().sendUsageData('Telemetry Opt-Reset', undefined, true);
    deleteIsSendingTelemetry();
    telemetryCommon.getLogger()?.debug('Usage data setting has been reset');
};

const isRenderer = process && process.type === 'renderer';

const getTelemetry = () => {
    if (isRenderer) {
        return telemetryRenderer;
    }

    return telemetryMain;
};

const sendUsageData = async (action: string, metadata?: Metadata) => {
    if (
        await getTelemetry().sendUsageData(
            `${getFriendlyAppName()}: ${action}`,
            flatObject(metadata)
        )
    ) {
        telemetryCommon
            .getLogger()
            ?.debug(`Sending usage data ${JSON.stringify(action)}`);
    }
};

const sendPageView = (pageName: string) =>
    getTelemetry().sendPageView(`${getFriendlyAppName()} - ${pageName}`);

const sendMetric = (name: string, average: number) =>
    getTelemetry().sendMetric(name, average);

const sendTrace = (message: string) => getTelemetry().sendTrace(message);

const sendErrorReport = (error: string | Error) => {
    telemetryCommon.getLogger()?.error(error);
    return getTelemetry().sendErrorReport(
        typeof error === 'string' ? new Error(error) : error
    );
};

export default {
    setLogger: telemetryCommon.setLogger,
    disable,
    enable,
    isEnabled: telemetryCommon.isEnabled,
    reset,
    sendErrorReport,
    sendUsageData,
    sendPageView,
    sendMetric,
    sendTrace,
    enableTelemetry: telemetryCommon.enableTelemetry,
};
