/*
 * Copyright (c) 2105 Nordic Semiconductor ASA
 *
 * SPDX-License-Identifier: LicenseRef-Nordic-4-Clause
 */

import { ApplicationInsights } from '@microsoft/applicationinsights-web';

import { getAppSource } from './appDirs';
import { isDevelopment } from './environment';
import { packageJson } from './packageJson';
import { getUsageDataClientId } from './persistentStore';
import usageDataCommon, {
    INSTRUMENTATION_KEY,
    Metadata,
} from './usageDataCommon';

let cachedInsights: ApplicationInsights | undefined;

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

    const accountId = getUsageDataClientId();

    const out = new ApplicationInsights({
        config: {
            instrumentationKey: INSTRUMENTATION_KEY,
            accountId, // to hide with removeAllMetadata
        },
    });

    out.loadAppInsights();

    // Add app name and version to every event
    out.addTelemetryInitializer(envelope => {
        if (envelope.data?.removeAllMetadata) {
            envelope.data = {};
            envelope.baseData = { name: envelope.baseData?.name };
            envelope.ext = {};
            envelope.tags = [];
        } else {
            const trace = {
                ...(envelope.ext?.trace ?? {}),
                name: applicationName,
            };
            envelope.ext = { ...envelope.ext, trace };
            envelope.baseData = {
                applicationName,
                applicationVersion,
                isDevelopment,
                source:
                    applicationName === 'nrfconnect'
                        ? undefined
                        : getAppSource(),
                ...envelope.baseData,
            };
        }
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
            forceSend ? { removeAllMetadata: true } : metadata
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
