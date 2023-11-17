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

const getInsights = (sendingOptOut?: boolean) => {
    if (!usageDataCommon.getShouldSendTelemetry(sendingOptOut)) return;

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

    const result = new TelemetryClient(INSTRUMENTATION_KEY);
    result.config.enableAutoCollectConsole = false;
    result.config.enableAutoCollectDependencies = false;
    result.config.enableAutoCollectExceptions = false;
    result.config.enableAutoCollectIncomingRequestAzureFunctions = false;
    result.config.enableAutoCollectHeartbeat = false;
    result.config.enableAutoCollectPerformance = false;
    result.config.enableAutoCollectPreAggregatedMetrics = false;
    result.config.enableAutoCollectRequests = false;
    result.config.enableAutoDependencyCorrelation = false;

    // Add app name and version to every event
    result.addTelemetryProcessor(envelope => {
        if (envelope.data.baseData?.properties.removeAllMetadata) {
            envelope.tags = [];
            envelope.data.baseData = { name: envelope.data?.baseData.name };
        } else {
            envelope.tags['ai.cloud.roleInstance'] = undefined; // remove PC name
            if (envelope.data.baseData) {
                envelope.data.baseData.properties = {
                    applicationName,
                    applicationVersion,
                    isDevelopment,
                    ...envelope.data.baseData.properties,
                };
            }
        }

        return true;
    });

    return result;
};

const sendUsageData = (
    action: string,
    metadata?: Metadata,
    sendingOptOut?: boolean
) => {
    const result = getInsights(sendingOptOut);
    if (result !== undefined) {
        result.trackEvent({
            name: action,
            properties: sendingOptOut ? { removeAllMetadata: true } : metadata,
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
