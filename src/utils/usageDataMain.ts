/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TelemetryClient } from 'applicationinsights';

import { getAppSource } from './appDirs';
import { isDevelopment } from './environment';
import packageJson from './packageJson';
import { getIsSendingUsageData } from './persistentStore';
import { type Metadata } from './usageData';

const INSTRUMENTATION_KEY = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

let insights: TelemetryClient | undefined;

const getInsights = (forceSend?: boolean) => {
    if (!forceSend && !getIsSendingUsageData()) return;

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

    // appInsights
    //     .setup(CONNECTION_STRING)
    //     .setAutoCollectConsole(false)
    //     .setAutoCollectDependencies(false)
    //     .setAutoCollectExceptions(false)
    //     .setAutoCollectIncomingRequestAzureFunctions(false)
    //     .setAutoCollectHeartbeat(false)
    //     .setAutoCollectPerformance(false)
    //     .setAutoCollectPreAggregatedMetrics(false)
    //     .setAutoCollectRequests(false)
    //     .setAutoDependencyCorrelation(false)
    //     .start();

    const out = new TelemetryClient(INSTRUMENTATION_KEY);

    // Add app name and version to every event
    out.addTelemetryProcessor(envelope => {
        envelope.data.baseData = {
            ...envelope.data.baseData,
            applicationName,
            applicationVersion,
            isDevelopment,
            source: getAppSource(),
        };

        envelope.data;

        return true;
    });

    // logger?.debug(
    //     `Application Insights for category ${applicationName} has initialized`
    // );

    return out;
};

const sendUsageData = (
    action: string,
    metadata?: Metadata,
    forceSend?: boolean
) => {
    const result = getInsights(forceSend);
    if (result !== undefined) {
        result.trackEvent({
            name: action,
            properties: metadata,
        });
        return true;
    }

    return false;
};

const sendPageView = (pageName: string) => {
    getInsights()?.trackPageView({
        name: pageName,
    });
};

const sendMetric = (name: string, value: number) => {
    getInsights()?.trackMetric({
        name,
        value,
    });
};

const sendTrace = (message: string) => {
    getInsights()?.trackTrace({
        message,
    });
};

const sendErrorReport = (error: Error) => {
    getInsights()?.trackException({
        exception: error,
    });
};

export default {
    sendErrorReport,
    sendUsageData,
    sendPageView,
    sendMetric,
    sendTrace,
};
