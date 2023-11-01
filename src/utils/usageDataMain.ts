/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TelemetryClient } from 'applicationinsights';

import { isDevelopment } from './environment';
import { packageJson } from './packageJson';
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

    const out = new TelemetryClient(INSTRUMENTATION_KEY);
    out.config.enableAutoCollectConsole = false;
    out.config.enableAutoCollectDependencies = false;
    out.config.enableAutoCollectExceptions = false;
    out.config.enableAutoCollectIncomingRequestAzureFunctions = false;
    out.config.enableAutoCollectHeartbeat = false;
    out.config.enableAutoCollectPerformance = false;
    out.config.enableAutoCollectPreAggregatedMetrics = false;
    out.config.enableAutoCollectRequests = false;
    out.config.enableAutoDependencyCorrelation = false;

    // Add app name and version to every event
    out.addTelemetryProcessor(envelope => {
        envelope.tags['ai.cloud.roleInstance'] = undefined; // remove PC name
        envelope.data.baseData = {
            ...envelope.data.baseData,
            applicationName,
            applicationVersion,
            isDevelopment,
        };

        return true;
    });

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
