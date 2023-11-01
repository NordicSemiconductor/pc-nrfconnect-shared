/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { getAppSource } from './appDirs';
import { isDevelopment } from './environment';
import { packageJson } from './packageJson';
import { getIsSendingUsageData, getUsageDataClientId } from './persistentStore';
import { type Metadata } from './usageData';

const INSTRUMENTATION_KEY = '4b8b1a39-37c7-479e-a684-d4763c7c647c';

let insights: ApplicationInsights | undefined;

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

    const accountId = getUsageDataClientId();

    const out = new ApplicationInsights({
        config: {
            instrumentationKey: INSTRUMENTATION_KEY,
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

    return out;
};

const sendUsageData = (
    action: string,
    metadata?: Metadata,
    forceSend?: boolean
) => {
    const result = getInsights(forceSend);
    if (result !== undefined) {
        result.trackEvent(
            {
                name: action,
            },
            metadata
        );
        return true;
    }

    return false;
};

const sendPageView = (pageName: string) => {
    getInsights()?.trackPageView({
        name: pageName,
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
