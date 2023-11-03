/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { TelemetryClient } from 'applicationinsights';

import { isDevelopment } from './environment';
import { packageJson } from './packageJson';
import usageDataCommon, {
    INSTRUMENTATION_KEY,
    Metadata,
} from './usageDataCommon';

let cachedInsights: TelemetryClient | undefined;

const getInsights = (forceSend?: boolean) => {
    if (!usageDataCommon.getShouldSendTelemetry(forceSend)) return;

    if (cachedInsights) {
        return cachedInsights;
    }

    if (!cachedInsights) {
        cachedInsights = init();
    }

    return cachedInsights;
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
        if (envelope.data.baseData?.removeAllMetadata) {
            envelope.tags = [];
            envelope.data.baseData = { name: envelope.data?.baseData };
        } else {
            envelope.tags['ai.cloud.roleInstance'] = undefined; // remove PC name
            envelope.data.baseData = {
                applicationName,
                applicationVersion,
                isDevelopment,
                ...envelope.data.baseData,
            };
        }

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
            properties: forceSend ? { removeAllMetadata: true } : metadata,
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
