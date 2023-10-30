/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import winston from 'winston';

import {
    AppPackageJson,
    LauncherPackageJson,
} from '../../ipc/schema/packageJson';
import { getAppSource } from './appDirs';
import { isDevelopment } from './environment';
import packageJson from './packageJson';
import {
    deleteIsSendingUsageData,
    getIsSendingUsageData,
    getUsageDataClientId,
    persistIsSendingUsageData,
} from './persistentStore';

const instrumentationKey = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

let logger: winston.Logger | undefined;
const setLogger = (log: winston.Logger) => {
    logger = log;
};

export interface Metadata {
    [key: string]: unknown;
}

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

let insights: ApplicationInsights | undefined;

const getInsights = () => {
    if (!getIsSendingUsageData()) return;

    if (insights) {
        return insights;
    }

    if (!insights) {
        insights = init();
    }

    return insights;
};

const init = () => {
    const appPackageJson = packageJson();
    const applicationName = appPackageJson.name;
    const applicationVersion = appPackageJson.version;

    if (!getIsSendingUsageData()) return;

    const accountId = getUsageDataClientId();

    const out = new ApplicationInsights({
        config: {
            instrumentationKey,
            accountId,
        },
    });

    out.loadAppInsights();

    // Add app name and version to every event
    out.addTelemetryInitializer(envelope => {
        const trace = {
            ...(envelope.ext?.trace ?? {}),
            name: applicationName,
        };
        envelope.ext = { ...envelope.ext, trace };
        envelope.data = {
            ...envelope.data,
            applicationName,
            applicationVersion,
            isDevelopment,
            source: getAppSource(),
        };
    });

    logger?.debug(
        `Application Insights for category ${applicationName} has initialized`
    );

    return out;
};

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

const sendUsageData = <T extends string>(action: T, metadata?: Metadata) => {
    const result = getInsights();
    if (result !== undefined) {
        logger?.debug(`Sending usage data ${JSON.stringify(action)}`);
        result.trackEvent(
            {
                name: `${getFriendlyAppName(packageJson())}: ${action}`,
            },
            flattenObject(metadata)
        );
    }
};

const sendPageView = (pageName: string) => {
    getInsights()?.trackPageView({
        name: `${getFriendlyAppName(packageJson())} - ${pageName}`,
    });
};

const sendMetric = (name: string, average: number) => {
    getInsights()?.trackMetric({
        name,
        average,
    });
};

const sendTrace = (message: string) => {
    getInsights()?.trackTrace({
        message,
    });
};

const sendErrorReport = (error: string) => {
    logger?.error(error);
    getInsights()?.trackException({
        exception: new Error(error),
    });
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
